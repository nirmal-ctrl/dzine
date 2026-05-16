import { useState, useEffect } from 'react';
import { Settings, Wand2, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { type PixelCrop } from 'react-image-crop';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Shared
import type { ImageAsset, StrategyContext, AppConfig, PendingCrop, InspirationCategory, TraceStep, ImagenConfig } from "@/shared/types";

// Modular Components
import { SettingsView } from "@/components/views/SettingsView";
import { CropView } from "@/components/views/CropView";
import { GeneratedImageView } from "@/components/GeneratedImageView";
import { GenerationTraceView } from "@/components/GenerationTraceView";
import { StrategySection } from "@/components/sections/StrategySection";
import { InspirationSection } from "@/components/sections/InspirationSection";
import { ImagenConfigSection } from "@/components/sections/ImagenConfigSection";
import { AuthView } from "@/components/views/AuthView";
import { PaywallView } from "@/components/views/PaywallView";
import { LicenseView } from "@/components/views/LicenseView";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useLicense } from "@/hooks/useLicense";

// Utils
import {
  getCategoryAnalysisPrompt,
  synthesizeImagenPrompt,
  getAspectRatioForPlatform,
  groupImagesByCategory
} from "@/utils/imagenPromptBuilder";

export default function App() {
  // Auth & License
  const { user, loading: authLoading } = useAuth();
  const licenseInfo = useLicense();
  const [licensedOnce, setLicensedOnce] = useState(false);

  // Once license confirmed, remember it for the session
  useEffect(() => {
    if (licenseInfo.valid) setLicensedOnce(true);
  }, [licenseInfo.valid]);

  const [view, setView] = useState<'home' | 'settings' | 'crop' | 'generating' | 'generated' | 'activate'>('home');
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [strategy, setStrategy] = useState<StrategyContext>({
    goal: 'Drive Engagement',
    platform: 'Instagram Feed',
    audience: 'General',
    additionalReq: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [designRecipe, setDesignRecipe] = useState<string>('');
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  // Check for Vertex AI mode
  const isVertexAI = import.meta.env.VITE_IS_NOT_API_ACCESS === 'true';

  const [config, setConfig] = useState<AppConfig>({
    apiKey: '',
    model: 'gemini-2.5-flash',
    endpoint: '',
    projectId: '',
    location: 'us-central1',
    googleCloudToken: ''
  });

  const [imagenConfig, setImagenConfig] = useState<ImagenConfig>({
    model: 'gemini-3-pro-image',
    numberOfImages: 1,
    imageSize: '1K',
    aspectRatio: 'auto',
    personGeneration: 'allow_adult',
    temperature: 1.0,
    topP: 0.95
  });

  const [advancedMode, setAdvancedMode] = useState(false);

  // Auto-update aspect ratio when platform changes
  useEffect(() => {
    if (imagenConfig.aspectRatio === 'auto') {
      // Keep it as auto, the actual ratio will be determined during generation
      return;
    }
    // If user manually changed it, don't override
  }, [strategy.platform, imagenConfig.aspectRatio]);

  // Selection Logic
  const [activeCategory, setActiveCategory] = useState<InspirationCategory | null>(null);

  // Cropping State
  const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage?.local.get(['images', 'quicks_config', 'pending_crop', 'strategy', 'active_category'], (result) => {
      if (result.images) setImages(result.images as ImageAsset[]);
      if (result.quicks_config) setConfig(result.quicks_config as AppConfig);
      if (result.strategy) setStrategy(result.strategy as StrategyContext);
      if (result.active_category) setActiveCategory(result.active_category as InspirationCategory);
      if (result.advanced_mode !== undefined) setAdvancedMode(!!result.advanced_mode);

      if (result.pending_crop) {
        setPendingCropImage((result.pending_crop as PendingCrop).dataUrl);
        setView('crop');
      }
    });

    const changeListener = (changes: any, areaName: string) => {
      if (areaName === 'local') {
        if (changes.images) setImages(changes.images.newValue as ImageAsset[]);
        if (changes.pending_crop?.newValue) {
          setPendingCropImage((changes.pending_crop.newValue as PendingCrop).dataUrl);
          setView('crop');
        }
        if (changes.advanced_mode) setAdvancedMode(changes.advanced_mode.newValue);
      }
    };
    chrome.storage?.onChanged.addListener(changeListener);
    return () => chrome.storage?.onChanged.removeListener(changeListener);
  }, []);

  const saveConfig = () => {
    chrome.storage?.local.set({ quicks_config: config });
    setView('home');
  };

  const updateStrategy = (key: keyof StrategyContext, value: string) => {
    const newStrategy = { ...strategy, [key]: value };
    setStrategy(newStrategy);
    chrome.storage?.local.set({ strategy: newStrategy });
  };

  const toggleAdvancedMode = (enabled: boolean) => {
    setAdvancedMode(enabled);
    chrome.storage?.local.set({ advanced_mode: enabled });
  };

  const startSelection = async (category: InspirationCategory) => {
    console.log('[App] startSelection called for:', category);
    setActiveCategory(category);

    // Ensure storage is set before closing
    await chrome.storage?.local.set({ active_category: category });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      console.log('[App] Sending TOGGLE_SELECTION to tab:', tab.id);
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SELECTION', active: true });
      } catch (e) {
        console.error('[App] Error sending message:', e);
      }

      console.log('[App] Closing window');

    } else {
      console.error('[App] No active tab found');
    }
  };

  const onConfirmCrop = (completedCrop: PixelCrop, image: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      const base64 = canvas.toDataURL('image/jpeg');

      // Add with current category
      const category = activeCategory || 'elements';
      const newImages = [...images, { id: crypto.randomUUID(), dataUrl: base64, category }];

      setImages(newImages);
      chrome.storage.local.set({ images: newImages });

      // Reset
      chrome.storage.local.remove(['pending_crop', 'active_category']);
      setPendingCropImage(null);
      setActiveCategory(null);
      setView('home');
    }
  };

  const cancelCrop = () => {
    chrome.storage.local.remove(['pending_crop', 'active_category']);
    setPendingCropImage(null);
    setActiveCategory(null);
    setView('home');
  };

  const deleteImage = (id: string) => {
    const newImages = images.filter(i => i.id !== id);
    setImages(newImages);
    chrome.storage.local.set({ images: newImages });
  };

  const clearAllImages = () => {
    setImages([]);
    chrome.storage.local.set({ images: [] });
  };

  const updateTraceStep = (id: string, updates: Partial<TraceStep>) => {
    setTraceSteps(prev => prev.map(step =>
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const handleImageUpload = (file: File, category: InspirationCategory) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        // Use functional update to avoid stale closure
        setImages(prev => {
          const newImages = [...prev, { id: crypto.randomUUID(), dataUrl: base64, category }];
          chrome.storage.local.set({ images: newImages });
          return newImages;
        });
      }
    };
    reader.onerror = (err) => {
      console.error('[App] FileReader error:', err);
    };
    reader.readAsDataURL(file);
  };

  const generateArtifact = async () => {
    if (isVertexAI) {
      if (!config.projectId || !config.googleCloudToken) {
        alert('Please set Project ID and Google Cloud Token in Settings');
        setView('settings');
        return;
      }
    } else {
      if (!config.apiKey) {
        alert('Please set your API Key in Settings');
        setView('settings');
        return;
      }
    }

    if (images.length === 0) {
      alert('Please add at least one inspiration image before generating.');
      return;
    }

    // Initialize trace steps
    const groupedImages = groupImagesByCategory(images);
    const steps: TraceStep[] = [];
    let stepId = 1;

    // Add analysis steps for categories with images
    (['layout', 'color', 'typography', 'elements'] as InspirationCategory[]).forEach(category => {
      if (groupedImages[category].length > 0) {
        steps.push({
          id: String(stepId++),
          category,
          status: 'pending',
          title: `Analyzing ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          images: groupedImages[category],
          timestamp: Date.now()
        });
      }
    });

    // Add synthesis and generation steps
    steps.push({
      id: String(stepId++),
      status: 'pending',
      title: 'Synthesizing Prompt',
      timestamp: Date.now()
    });

    steps.push({
      id: String(stepId++),
      status: 'pending',
      title: `Generating with ${imagenConfig.model === 'imagen-4.0' ? 'Imagen 4.0' : 'Gemini 3 Pro Image'}`,
      timestamp: Date.now()
    });

    setTraceSteps(steps);
    setGeneratedImages([]);
    setView('generating');
    setLoading(true);

    try {
      // Initialize Client based on mode
      let client;
      if (isVertexAI) {
        client = new GoogleGenAI({
          vertexai: true,
          project: config.projectId!,
          location: config.location || 'us-central1',
          httpOptions: {
            headers: {
              'Authorization': `Bearer ${config.googleCloudToken}`
            }
          }
        });
      } else {
        // Fallback for analysis using old SDK if needed, BUT for consistency keeping it simple.
        // However, the original code used GoogleGenerativeAI for analysis.
        // Let's try to use GoogleGenAI for everything if possible, or keep separate paths.
        // The new SDK (@google/genai) handles both if initialized correctly.
        // BUT, to minimize risk of breaking the existing flow, I will just branch the initialization.
      }


      const categoryInsights: Record<InspirationCategory, string> = {
        layout: '',
        color: '',
        typography: '',
        elements: ''
      };

      // Step 1-4: Analyze each category
      let currentStepIndex = 0;
      for (const category of ['layout', 'color', 'typography', 'elements'] as InspirationCategory[]) {
        const categoryImages = groupedImages[category];
        if (categoryImages.length > 0) {
          const stepId = steps[currentStepIndex].id;
          const startTime = Date.now();

          const analysisPrompt = getCategoryAnalysisPrompt(category);
          updateTraceStep(stepId, {
            status: 'in-progress',
            prompt: analysisPrompt
          });

          let responseText = '';

          if (isVertexAI && client) {
            // Use Vertex AI Client
            const imageParts = categoryImages.map(img => ({
              inlineData: {
                data: img.dataUrl.split(',')[1],
                mimeType: "image/jpeg"
              }
            }));

            const result = await client.models.generateContent({
              model: config.model, // e.g. gemini-2.5-flash
              contents: [
                { text: analysisPrompt },
                ...imageParts
              ]
            });
            responseText = result.text || '';
          } else {
            // Existing Logic with GoogleGenerativeAI
            const genAI = new GoogleGenerativeAI(config.apiKey);
            const model = genAI.getGenerativeModel({ model: config.model });

            const imageParts = categoryImages.map(img => ({
              inlineData: {
                data: img.dataUrl.split(',')[1],
                mimeType: "image/jpeg"
              }
            }));

            const result = await model.generateContent([analysisPrompt, ...imageParts]);
            const response = await result.response;
            responseText = response.text();
          }

          categoryInsights[category] = responseText;

          updateTraceStep(stepId, {
            status: 'complete',
            response: categoryInsights[category],
            duration: (Date.now() - startTime) / 1000
          });

          currentStepIndex++;
        }
      }

      // Step: Synthesize prompt
      const synthesisStepId = steps[currentStepIndex].id;
      updateTraceStep(synthesisStepId, { status: 'in-progress' });

      const imagenPrompt = synthesizeImagenPrompt(categoryInsights, strategy);

      const recipeText = `# Design Analysis\n\n${Object.entries(categoryInsights)
        .filter(([_, insight]) => insight)
        .map(([category, insight]) => `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n${insight}`)
        .join('\n\n')}\n\n# Generated Prompt\n${imagenPrompt}`;
      setDesignRecipe(recipeText);

      updateTraceStep(synthesisStepId, {
        status: 'complete',
        response: imagenPrompt,
        duration: 0.1
      });

      currentStepIndex++;

      // Step: Generate images
      const generationStepId = steps[currentStepIndex].id;
      const genStartTime = Date.now();
      updateTraceStep(generationStepId, {
        status: 'in-progress',
        prompt: imagenPrompt
      });

      const aspectRatio = imagenConfig.aspectRatio === 'auto'
        ? getAspectRatioForPlatform(strategy.platform)
        : imagenConfig.aspectRatio;

      let generatedImageUrls: string[] = [];

      if (imagenConfig.model === 'imagen-4.0') {
        const clientOptions = isVertexAI ? {
          vertexai: true,
          project: config.projectId!,
          location: config.location || 'us-central1',
          httpOptions: {
            headers: {
              'Authorization': `Bearer ${config.googleCloudToken}`
            }
          }
        } : { apiKey: config.apiKey };

        const imagenAI = new GoogleGenAI(clientOptions);
        const imagenResponse = await imagenAI.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: imagenPrompt,
          config: {
            numberOfImages: imagenConfig.numberOfImages,
            imageSize: imagenConfig.imageSize,
            aspectRatio: aspectRatio as any,
            personGeneration: imagenConfig.personGeneration as any,
          },
        });

        if (!imagenResponse.generatedImages || imagenResponse.generatedImages.length === 0) {
          throw new Error('No images were generated by Imagen');
        }

        generatedImageUrls = imagenResponse.generatedImages.map(img => {
          if (!img?.image?.imageBytes) {
            throw new Error('Invalid image data received');
          }
          return `data:image/png;base64,${img.image.imageBytes}`;
        });
      } else {
        // Use Gemini 3 Pro Image (via GoogleGenAI SDK)
        // Gemini 3 Pro Image uses generateContent with responseModalities for images

        // Add reference images (limit 14)
        const referenceImages = images.slice(0, 14).map(img => {
          try {
            const base64Data = img.dataUrl.split(',')[1];
            if (!base64Data) return null;
            return {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            };
          } catch (e) {
            console.warn('Invalid image data skipped:', img.id);
            return null;
          }
        }).filter(item => item !== null) as any[];

        const clientOptions = isVertexAI ? {
          vertexai: true,
          project: config.projectId!,
          location: config.location || 'us-central1',
          httpOptions: {
            headers: {
              'Authorization': `Bearer ${config.googleCloudToken}`
            }
          }
        } : { apiKey: config.apiKey };

        const geminiAI = new GoogleGenAI(clientOptions);
        const geminiResponse = await geminiAI.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: [
            { text: imagenPrompt },
            ...referenceImages
          ],
          // @ts-ignore - The SDK types might not fully support imageConfig in generateContent yet
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: aspectRatio as any,
              ...(imagenConfig.imageSize ? { imageSize: imagenConfig.imageSize } : {})
            },
            // Flat configuration for candidateCount and temperature/topP
            candidateCount: imagenConfig.numberOfImages,
            ...(imagenConfig.temperature || imagenConfig.topP ? {
              temperature: imagenConfig.temperature,
              topP: imagenConfig.topP
            } : {})
          },
        });

        if (!geminiResponse.candidates?.[0]?.content?.parts || geminiResponse.candidates[0].content.parts.length === 0) {
          throw new Error('No images were generated by Gemini 3 Pro');
        }

        generatedImageUrls = geminiResponse.candidates[0].content.parts
          .filter(part => part.inlineData && part.inlineData.data)
          .map(part => {
            return `data:${part.inlineData?.mimeType || 'image/png'};base64,${part.inlineData?.data}`;
          });

        if (generatedImageUrls.length === 0) {
          throw new Error('No valid image data found in response');
        }
      }

      setGeneratedImages(generatedImageUrls);

      updateTraceStep(generationStepId, {
        status: 'complete',
        response: `Successfully generated ${generatedImageUrls.length} image(s)`,
        duration: (Date.now() - genStartTime) / 1000
      });

    } catch (e) {
      console.error('Error generating:', e);
      const errorMessage = (e as Error).message;

      // Update the current step with error
      const currentStep = traceSteps.find(s => s.status === 'in-progress');
      if (currentStep) {
        updateTraceStep(currentStep.id, {
          status: 'error',
          error: errorMessage
        });
      }

      alert('Error generating: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ── License Gates ──────────────────────────────────────
  if (!licensedOnce) {
    if (licenseInfo.loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!licenseInfo.valid) {
      return <LicenseView onSuccess={() => setLicensedOnce(true)} />;
    }
  }
  // ─────────────────────────────────────────────────────────────

  if (view === 'settings') {
    return <SettingsView
      config={config}
      onConfigChange={setConfig}
      onSave={saveConfig}
      onBack={() => setView('home')}
      user={user}
      licenseInfo={licenseInfo}
      onActivateRequest={() => setView('activate')}
    />;
  }

  if (view === 'activate') {
    return <LicenseView onSuccess={() => {
      setLicensedOnce(true);
      setView('home');
    }} />;
  }

  if (view === 'crop' && pendingCropImage) {
    return <CropView
      imageSrc={pendingCropImage}
      category={activeCategory}
      onConfirm={onConfirmCrop}
      onCancel={cancelCrop}
    />;
  }



  const refineArtifact = async (prompt: string, refineImages: ImageAsset[], baseImage?: string) => {
    if (isVertexAI) {
      if (!config.projectId || !config.googleCloudToken) {
        alert('Please set Project ID and Google Cloud Token in Settings');
        return;
      }
    } else {
      if (!config.apiKey) {
        alert('Please set your API Key in Settings');
        return;
      }
    }

    setLoading(true);
    const stepId = `refine-${Date.now()}`;

    // Add refinement step to trace
    setTraceSteps(prev => [...prev, {
      id: stepId,
      status: 'in-progress',
      title: 'Generating Variation',
      prompt: prompt,
      timestamp: Date.now()
    }]);

    try {
      // Prepare images: Base image + new inspiration
      const imageParts: any[] = [];

      if (baseImage) {
        imageParts.push({
          inlineData: {
            mimeType: "image/png",
            data: baseImage.split(',')[1]
          }
        });
      }

      refineImages.forEach(img => {
        imageParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: img.dataUrl.split(',')[1]
          }
        });
      });

      // Construct prompt with context
      const fullPrompt = baseImage
        ? `Refine this design based on these instructions: ${prompt}`
        : `${designRecipe}\n\nAdditional Instructions: ${prompt}`;

      const clientOptions = isVertexAI ? {
        vertexai: true,
        project: config.projectId!,
        location: config.location || 'us-central1',
        httpOptions: {
          headers: {
            'Authorization': `Bearer ${config.googleCloudToken}`
          }
        }
      } : { apiKey: config.apiKey };

      const geminiAI = new GoogleGenAI(clientOptions);
      const startTime = Date.now();

      const geminiResponse = await geminiAI.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [
          { text: fullPrompt },
          ...imageParts
        ],
        // @ts-ignore
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: imagenConfig.aspectRatio === 'auto' ? undefined : imagenConfig.aspectRatio as any,
          },
          candidateCount: 1,
        },
      });

      if (!geminiResponse.candidates?.[0]?.content?.parts?.length) {
        throw new Error('No images generated');
      }

      const newImageUrls = geminiResponse.candidates[0].content.parts
        .filter(part => part.inlineData && part.inlineData.data)
        .map(part => `data:${part.inlineData?.mimeType || 'image/png'};base64,${part.inlineData?.data}`);

      if (newImageUrls.length > 0) {
        setGeneratedImages(prev => [...prev, ...newImageUrls]);

        updateTraceStep(stepId, {
          status: 'complete',
          response: 'Variation generated successfully',
          duration: (Date.now() - startTime) / 1000
        });
      }

    } catch (e) {
      console.error('Refinement error:', e);
      updateTraceStep(stepId, {
        status: 'error',
        error: (e as Error).message
      });
      alert('Error refining: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };



  if (view === 'generating') {
    return <GenerationTraceView
      steps={traceSteps}
      generatedImages={generatedImages}
      onClose={() => setView('home')}
      isGenerating={loading}
      onRefine={refineArtifact}
    />;
  }

  if (view === 'generated' && generatedImages.length > 0) {
    return <GeneratedImageView
      imageUrl={generatedImages[generatedImages.length - 1]}
      designSpec={designRecipe}
      onClose={() => setView('home')}
      onRegenerate={() => {
        setView('home');
        setTimeout(() => generateArtifact(), 100);
      }}
      onRefine={refineArtifact}
    />;
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded-md">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight">Quicks Design</h1>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setView('settings')}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 bg-muted/5">
        <div className="px-4 py-6 space-y-8">

          <StrategySection strategy={strategy} onUpdate={updateStrategy} />

          <Separator />

          <InspirationSection
            advancedMode={advancedMode}
            onToggleMode={toggleAdvancedMode}
            images={images}
            onSelectCategory={startSelection}
            onDeleteImage={deleteImage}
            onClearAll={clearAllImages}
            onUpload={handleImageUpload}
          />

          <Separator />

          {/* Additional Request - Left in App.tsx as it's simple, or could be extracted too. Let's keep it here for now as it's part of context but generic */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Badge variant="outline" className="bg-background text-primary border-primary/20">Step 3</Badge>
              <h2 className="text-sm font-semibold tracking-tight">Specifics</h2>
            </div>
            <Textarea
              className="resize-none min-h-[80px] text-sm bg-card"
              placeholder="Any specific text, tagline preference, or additional requirements..."
              value={strategy.additionalReq}
              onChange={(e) => updateStrategy('additionalReq', e.target.value)}
            />
          </section>

          <Separator />

          <ImagenConfigSection
            config={imagenConfig}
            onChange={setImagenConfig}
            platform={strategy.platform}
          />

          <div className="h-12" />

        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background">
        <Button
          className="w-full rounded-full shadow-lg h-11 text-base font-medium"
          onClick={generateArtifact}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {loading ? 'Designing...' : 'Generate Design Recipe'}
        </Button>
      </div>
    </div>
  );
}
