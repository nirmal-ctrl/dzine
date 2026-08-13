import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GoogleGenAI, PersonGeneration } from '@google/genai';
import { type PixelCrop } from 'react-image-crop';

// Shared
import type {
    AppConfig,
    BrandProfile,
    CreativeBrief,
    FeedbackRating,
    GeneratedAsset,
    Generation,
    PendingCrop,
} from '@/shared/types';
import {
    DEFAULT_BRAND,
    DEFAULT_BRIEF,
    buildCreativePrompt,
    buildRemakePrompt,
    buildRefinementPrompt,
    buildSmartPromptRequest,
    buildVariantPrompt,
    getContentType,
    getQuality,
} from '@/shared/creativeSystem';

// Views & components
import { SettingsView } from '@/components/views/SettingsView';
import { CropView } from '@/components/views/CropView';
import { LicenseView } from '@/components/views/LicenseView';
import { Header } from '@/components/somae/Header';
import { BrandDialog } from '@/components/somae/BrandDialog';
import { CreateView } from '@/components/somae/CreateView';
import { GeneratingView } from '@/components/somae/GeneratingView';
import { ResultView } from '@/components/somae/ResultView';

// Hooks
import { useLicense } from '@/hooks/useLicense';
import { usePersistentState } from '@/hooks/usePersistentState';

type View = 'create' | 'generating' | 'result' | 'settings' | 'activate' | 'crop';

const MAX_HISTORY = 12;

// Check for Vertex AI mode
const isVertexAI = import.meta.env.VITE_IS_NOT_API_ACCESS === 'true';

// Dev-only preview bypass for the license gate (inert in production builds)
const isDevPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('preview');

/** Convert a data URL into a Gemini inlineData part */
function dataUrlToInlineData(dataUrl: string) {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?)(;|$)/);
    return {
        inlineData: {
            mimeType: mimeMatch?.[1] || 'image/png',
            data,
        },
    };
}

export default function App() {
    // ── License ──────────────────────────────────────────────
    const licenseInfo = useLicense();
    const [licensedOnce, setLicensedOnce] = useState(false);

    useEffect(() => {
        if (licenseInfo.valid) setLicensedOnce(true);
    }, [licenseInfo.valid]);

    // ── View & UI state ──────────────────────────────────────
    const [view, setView] = useState<View>('create');
    const [brandDialogOpen, setBrandDialogOpen] = useState(false);

    // ── Persistent state ─────────────────────────────────────
    const [brand, setBrand] = usePersistentState<BrandProfile>('somae_brand', DEFAULT_BRAND);
    const [brief, setBrief] = usePersistentState<CreativeBrief>('somae_brief', DEFAULT_BRIEF);
    const [history, setHistory] = usePersistentState<Generation[]>('somae_history', []);
    const [config, setConfig] = usePersistentState<AppConfig>('huenxt_config', {
        apiKey: '',
        model: 'gemini-2.5-flash',
        endpoint: '',
        projectId: '',
        location: 'us-central1',
        googleCloudToken: '',
        imageEngine: 'gemini',
    });

    // ── Generation state ─────────────────────────────────────
    const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
    const [activeAssetId, setActiveAssetId] = useState<string>('');
    const [apiDone, setApiDone] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [working, setWorking] = useState(false);
    const [workingLabel, setWorkingLabel] = useState('Generating your visual');
    const cancelledRef = useRef(false);
    const busyRef = useRef(false);

    // ── Crop flow (pick image from any webpage) ──────────────
    const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.storage?.local) return;

        chrome.storage.local.get(['pending_crop'], (result) => {
            if (result.pending_crop) {
                setPendingCropImage((result.pending_crop as PendingCrop).dataUrl);
                setView('crop');
            }
        });

        const changeListener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
            if (areaName === 'local' && changes.pending_crop?.newValue) {
                setPendingCropImage((changes.pending_crop.newValue as PendingCrop).dataUrl);
                setView('crop');
            }
        };
        chrome.storage.onChanged.addListener(changeListener);
        return () => chrome.storage.onChanged.removeListener(changeListener);
    }, []);

    // ── Derived state ────────────────────────────────────────
    const currentGeneration = history.find((g) => g.id === currentGenerationId) ?? null;

    // ── Config helpers ───────────────────────────────────────
    const hasCredentials = isVertexAI
        ? Boolean(config.projectId && config.googleCloudToken)
        : Boolean(config.apiKey);

    const buildClient = () => {
        if (isVertexAI) {
            return new GoogleGenAI({
                vertexai: true,
                project: config.projectId!,
                location: config.location || 'us-central1',
                httpOptions: {
                    headers: { Authorization: `Bearer ${config.googleCloudToken}` },
                },
            });
        }
        return new GoogleGenAI({ apiKey: config.apiKey });
    };

    /**
     * Core generation request. Sends the optimized prompt plus the
     * brand logo / reference / base image into the image model.
     */
    const runImageGeneration = async (
        prompt: string,
        images: string[],
        briefSnapshot: CreativeBrief
    ): Promise<string> => {
        const quality = getQuality(briefSnapshot.quality);
        const aspectRatio = getContentType(briefSnapshot.contentType).aspectRatio;
        const engine = config.imageEngine ?? 'gemini';

        if (engine === 'imagen') {
            // Imagen 4.0 — text-only engine (reference/logo images are not supported)
            const client = buildClient();
            const response = await client.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: {
                    numberOfImages: 1,
                    imageSize: quality.imageSize === '4K' ? '2K' : quality.imageSize,
                    aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
                    personGeneration: PersonGeneration.ALLOW_ADULT,
                },
            });
            const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
            if (!imageBytes) throw new Error('No image was generated. Please try again.');
            return `data:image/png;base64,${imageBytes}`;
        }

        // Gemini 3 Pro Image — supports reference + logo images
        const client = buildClient();
        const imageParts = images.map(dataUrlToInlineData);

        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [{ text: prompt }, ...imageParts],
            // @ts-ignore — imageConfig is not yet fully typed in the SDK
            config: {
                responseModalities: ['IMAGE'],
                imageConfig: {
                    aspectRatio,
                    imageSize: quality.imageSize,
                },
                candidateCount: 1,
            },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData?.data);
        if (!imagePart?.inlineData?.data) {
            throw new Error('No image was generated. Please try again.');
        }
        return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    };

    /** Images attached to a fresh generation: logo first, then reference */
    const briefImages = (briefSnapshot: CreativeBrief): string[] => {
        const imgs: string[] = [];
        if (brand.logoDataUrl) imgs.push(brand.logoDataUrl);
        if (briefSnapshot.referenceDataUrl) imgs.push(briefSnapshot.referenceDataUrl);
        return imgs;
    };

    const appendAsset = (generationId: string, asset: GeneratedAsset) => {
        setHistory((prev) =>
            prev.map((g) =>
                g.id === generationId ? { ...g, assets: [...g.assets, asset] } : g
            )
        );
        setActiveAssetId(asset.id);
    };

    // ── Actions ──────────────────────────────────────────────

    const updateBrief = (patch: Partial<CreativeBrief>) => {
        setBrief((prev) => ({ ...prev, ...patch }));
    };

    const handleGenerate = async () => {
        if (busyRef.current) return; // disable duplicate submissions

        if (!hasCredentials) {
            alert(
                isVertexAI
                    ? 'Please set your Project ID and Google Cloud Token in Settings first.'
                    : 'Please set your API Key in Settings first.'
            );
            setView('settings');
            return;
        }

        busyRef.current = true;
        cancelledRef.current = false;
        setGenerationError(null);
        setApiDone(false);
        setView('generating');

        const briefSnapshot = { ...brief };

        try {
            const prompt = buildCreativePrompt(briefSnapshot, brand);
            const dataUrl = await runImageGeneration(prompt, briefImages(briefSnapshot), briefSnapshot);

            if (cancelledRef.current) return;

            const generation: Generation = {
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                brief: briefSnapshot,
                assets: [
                    {
                        id: crypto.randomUUID(),
                        dataUrl,
                        kind: 'original',
                        createdAt: Date.now(),
                    },
                ],
            };

            setHistory((prev) => [generation, ...prev].slice(0, MAX_HISTORY));
            setCurrentGenerationId(generation.id);
            setActiveAssetId(generation.assets[0].id);
            setApiDone(true);
        } catch (e) {
            console.error('[Somae] Generation failed:', e);
            if (!cancelledRef.current) {
                setGenerationError((e as Error).message || 'Generation failed. Please try again.');
            }
        } finally {
            busyRef.current = false;
        }
    };

    /** Remake / Regenerate — same brief, fresh execution */
    const handleRemake = async () => {
        if (!currentGeneration || working || !hasCredentials) return;
        setWorking(true);
        setWorkingLabel('Remaking your design');
        try {
            const prompt = buildRemakePrompt(currentGeneration.brief, brand);
            const dataUrl = await runImageGeneration(
                prompt,
                briefImages(currentGeneration.brief),
                currentGeneration.brief
            );
            appendAsset(currentGeneration.id, {
                id: crypto.randomUUID(),
                dataUrl,
                kind: 'remake',
                createdAt: Date.now(),
            });
        } catch (e) {
            console.error('[Somae] Remake failed:', e);
            alert('Remake failed: ' + (e as Error).message);
        } finally {
            setWorking(false);
        }
    };

    /** New Variants — additional variations from the same brief */
    const handleNewVariant = async () => {
        if (!currentGeneration || working || !hasCredentials) return;
        setWorking(true);
        setWorkingLabel('Creating a new variant');
        try {
            const prompt = buildVariantPrompt(
                currentGeneration.brief,
                brand,
                currentGeneration.assets.length
            );
            const dataUrl = await runImageGeneration(
                prompt,
                briefImages(currentGeneration.brief),
                currentGeneration.brief
            );
            appendAsset(currentGeneration.id, {
                id: crypto.randomUUID(),
                dataUrl,
                kind: 'variant',
                createdAt: Date.now(),
            });
        } catch (e) {
            console.error('[Somae] Variant failed:', e);
            alert('Variant generation failed: ' + (e as Error).message);
        } finally {
            setWorking(false);
        }
    };

    /** Refine — conversational iteration on the current design */
    const handleRefine = async (instruction: string) => {
        if (!currentGeneration || working || !hasCredentials) return;
        const activeAsset =
            currentGeneration.assets.find((a) => a.id === activeAssetId) ??
            currentGeneration.assets[0];
        if (!activeAsset) return;

        setWorking(true);
        setWorkingLabel('Refining your design');
        try {
            const prompt = buildRefinementPrompt(instruction, currentGeneration.brief, brand);
            // Current image first (context), then the logo so it stays accurate
            const images = [activeAsset.dataUrl];
            if (brand.logoDataUrl) images.push(brand.logoDataUrl);

            const dataUrl = await runImageGeneration(prompt, images, currentGeneration.brief);
            appendAsset(currentGeneration.id, {
                id: crypto.randomUUID(),
                dataUrl,
                kind: 'refinement',
                refinementNote: instruction,
                createdAt: Date.now(),
            });
        } catch (e) {
            console.error('[Somae] Refinement failed:', e);
            alert('Refinement failed: ' + (e as Error).message);
        } finally {
            setWorking(false);
        }
    };

    /** Smart Prompt — restructure the user's notes into a clear brief */
    const handleSmartPrompt = async (text: string): Promise<string> => {
        if (!hasCredentials) {
            throw new Error(
                isVertexAI
                    ? 'Set your Project ID and Google Cloud Token in Settings to use Smart Prompt.'
                    : 'Set your API Key in Settings to use Smart Prompt.'
            );
        }
        const seed =
            text.trim() ||
            `A ${getContentType(brief.contentType).label} post for ${brand.name || 'our brand'} with the goal: ${brief.goal}.`;
        const client = buildClient();
        const result = await client.models.generateContent({
            model: config.model || 'gemini-2.5-flash',
            contents: [{ text: buildSmartPromptRequest(seed, brief) }],
        });
        const improved = result.text?.trim();
        if (!improved) throw new Error('Smart Prompt returned nothing. Try again.');
        return improved;
    };

    const handleDownload = (asset: GeneratedAsset) => {
        const link = document.createElement('a');
        link.href = asset.dataUrl;
        const brandSlug = (brand.name || 'somae').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${brandSlug}-design-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFeedback = (assetId: string, rating: FeedbackRating) => {
        if (!currentGenerationId) return;
        setHistory((prev) =>
            prev.map((g) =>
                g.id === currentGenerationId
                    ? {
                            ...g,
                            assets: g.assets.map((a) =>
                                a.id === assetId ? { ...a, feedback: rating } : a
                            ),
                        }
                    : g
            )
        );
    };

    const handleDuplicateBrief = () => {
        if (!currentGeneration) return;
        setBrief({ ...currentGeneration.brief });
        setView('create');
    };

    const handleDeleteGeneration = () => {
        if (!currentGenerationId) return;
        setHistory((prev) => prev.filter((g) => g.id !== currentGenerationId));
        setCurrentGenerationId(null);
        setActiveAssetId('');
        setView('create');
    };

    const handleOpenGeneration = (generationId: string) => {
        const generation = history.find((g) => g.id === generationId);
        if (!generation) return;
        setCurrentGenerationId(generationId);
        setActiveAssetId(generation.assets[generation.assets.length - 1]?.id ?? '');
    };

    // ── Crop flow handlers ───────────────────────────────────

    const startPickFromPage = async () => {
        if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            try {
                await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SELECTION', active: true });
            } catch (e) {
                console.error('[Somae] Could not start page selection:', e);
            }
        }
    };

    const onConfirmCrop = (completedCrop: PixelCrop, image: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

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
        const base64 = canvas.toDataURL('image/png');

        // Picked images become the creative reference
        updateBrief({ referenceDataUrl: base64 });

        chrome.storage?.local.remove(['pending_crop', 'active_category']);
        setPendingCropImage(null);
        setView('create');
    };

    const cancelCrop = () => {
        chrome.storage?.local.remove(['pending_crop', 'active_category']);
        setPendingCropImage(null);
        setView('create');
    };

    // ── License gates ────────────────────────────────────────
    if (!licensedOnce && !isDevPreview) {
        if (licenseInfo.loading) {
            return (
                <div className="flex h-screen items-center justify-center bg-background">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            );
        }
        if (!licenseInfo.valid) {
            return <LicenseView onSuccess={() => setLicensedOnce(true)} />;
        }
    }

    // ── Standalone views ─────────────────────────────────────
    if (view === 'settings') {
        return (
            <SettingsView
                config={config}
                onConfigChange={setConfig}
                onSave={() => setView('create')}
                onBack={() => setView('create')}
                licenseInfo={licenseInfo}
                onActivateRequest={() => setView('activate')}
            />
        );
    }

    if (view === 'activate') {
        return (
            <LicenseView
                onSuccess={() => {
                    setLicensedOnce(true);
                    setView('create');
                }}
            />
        );
    }

    if (view === 'crop' && pendingCropImage) {
        return (
            <CropView
                imageSrc={pendingCropImage}
                category={null}
                onConfirm={onConfirmCrop}
                onCancel={cancelCrop}
            />
        );
    }

    // ── Main shell ───────────────────────────────────────────
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <Header onSettings={() => setView('settings')} />

            {/* Content */}
            <main className="flex-1 overflow-y-auto scrollbar-thin">
                    {view === 'create' && (
                        <CreateView
                            brief={brief}
                            brand={brand}
                            onBrandClick={() => setBrandDialogOpen(true)}
                            onBriefChange={updateBrief}
                            onGenerate={handleGenerate}
                            onSmartPrompt={handleSmartPrompt}
                            onPickFromPage={startPickFromPage}
                        />
                    )}

                    {view === 'generating' && (
                        <GeneratingView
                            apiDone={apiDone}
                            error={generationError}
                            onComplete={() => setView('result')}
                            onCancel={() => {
                                cancelledRef.current = true;
                                setGenerationError(null);
                                setView('create');
                            }}
                        />
                    )}

                    {view === 'result' && currentGeneration && (
                        <ResultView
                            generation={currentGeneration}
                            history={history}
                            activeAssetId={activeAssetId}
                            onSelectAsset={setActiveAssetId}
                            onOpenGeneration={handleOpenGeneration}
                            onEditBrief={() => setView('create')}
                            onDownload={handleDownload}
                            onRemake={handleRemake}
                            onDuplicateBrief={handleDuplicateBrief}
                            onDeleteGeneration={handleDeleteGeneration}
                            onNewVariant={handleNewVariant}
                            onRefine={handleRefine}
                            onFeedback={handleFeedback}
                            working={working}
                            workingLabel={workingLabel}
                        />
                    )}
            </main>

            <BrandDialog
                open={brandDialogOpen}
                onOpenChange={setBrandDialogOpen}
                brand={brand}
                onSave={setBrand}
            />
        </div>
    );
}
