import { X, Loader2, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Shimmer } from '@/components/ui/shimmer';
import { Textarea } from '@/components/ui/textarea';
import type { TraceStep, ImageAsset, InspirationCategory } from '@/shared/types';
import { InspirationSection } from '@/components/sections/InspirationSection';
import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';

interface GenerationTraceViewProps {
    steps: TraceStep[];
    generatedImages: string[];
    onClose: () => void;
    isGenerating: boolean;
    onRefine: (prompt: string, images: ImageAsset[], baseImage?: string) => void;
}

export function GenerationTraceView({
    steps,
    generatedImages,
    onClose,
    isGenerating,
    onRefine
}: GenerationTraceViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentStepRef = useRef<HTMLDivElement>(null);
    const [refiningImage, setRefiningImage] = useState<string | null>(null);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [inspirationImages, setInspirationImages] = useState<ImageAsset[]>([]);

    // Auto-scroll to current step
    useEffect(() => {
        if (currentStepRef.current) {
            currentStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [steps]);

    const completedSteps = steps.filter(s => s.status === 'complete').length;
    const currentStep = steps.find(s => s.status === 'in-progress');

    const getStatusIcon = (status: TraceStep['status']) => {
        switch (status) {
            case 'complete':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-destructive" />;
            default:
                return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: TraceStep['status']) => {
        switch (status) {
            case 'complete':
                return 'border-green-500/20 bg-green-500/5';
            case 'in-progress':
                return 'border-primary/40 bg-primary/10';
            case 'error':
                return 'border-destructive/20 bg-destructive/5';
            default:
                return 'border-border bg-muted/20';
        }
    };

    const handleImageUpload = (file: File, category: InspirationCategory) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setInspirationImages(prev => [...prev, {
                id: nanoid(),
                dataUrl,
                category
            }]);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteImage = (id: string) => {
        setInspirationImages(prev => prev.filter(img => img.id !== id));
    };

    const handleRefineSubmit = (baseImage: string) => {
        onRefine(refinePrompt, inspirationImages, baseImage);
        setRefiningImage(null);
        setRefinePrompt('');
        setInspirationImages([]);
    };

    const cancelRefine = () => {
        setRefiningImage(null);
        setRefinePrompt('');
        setInspirationImages([]);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
                <div className="flex-1">
                    <h2 className="text-sm font-semibold tracking-tight">
                        {isGenerating ? 'Generating Design...' : 'Generation Complete'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Step {completedSteps} of {steps.length}
                        {currentStep && ` • ${currentStep.title}`}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onClose}
                    disabled={isGenerating}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="p-4 space-y-4">
                    {steps.map((step) => {
                        const isCurrentStep = step.status === 'in-progress';

                        return (
                            <div
                                key={step.id}
                                ref={isCurrentStep ? currentStepRef : null}
                                className={`rounded-lg border p-4 space-y-3 transition-all ${getStatusColor(step.status)}`}
                            >
                                {/* Step Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getStatusIcon(step.status)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium">
                                                    {step.title}
                                                </h3>
                                                {step.category && (
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {step.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            {step.status === 'error' && step.error && (
                                                <p className="text-xs text-destructive mt-1">{step.error}</p>
                                            )}
                                        </div>
                                    </div>
                                    {step.duration !== undefined && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {step.duration.toFixed(1)}s
                                        </span>
                                    )}
                                </div>

                                {/* Images */}
                                {step.images && step.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {step.images.map((img) => (
                                            <img
                                                key={img.id}
                                                src={img.dataUrl}
                                                alt={`${step.category} reference`}
                                                className="h-20 w-20 object-cover rounded border border-border flex-shrink-0"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Prompt */}
                                {step.prompt && (
                                    <details className="group">
                                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                            Prompt ▸
                                        </summary>
                                        <pre className="mt-2 text-xs bg-muted/50 p-3 rounded border border-border overflow-x-auto whitespace-pre-wrap">
                                            {isCurrentStep ? (
                                                <div className="space-y-1">
                                                    <div className="h-3 w-3/4 relative overflow-hidden rounded"><Shimmer className="absolute inset-0" /></div>
                                                    <div className="h-3 w-1/2 relative overflow-hidden rounded"><Shimmer className="absolute inset-0" /></div>
                                                </div>
                                            ) : (
                                                step.prompt
                                            )}
                                        </pre>
                                    </details>
                                )}

                                {/* Response */}
                                {step.response && (
                                    <details className="group">
                                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                            Response ▾
                                        </summary>
                                        <pre className="mt-2 text-xs bg-muted/50 p-3 rounded border border-border overflow-x-auto whitespace-pre-wrap">
                                            {step.response}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        );
                    })}

                    {/* Generated Images Timeline */}
                    {generatedImages.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-border">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <h3 className="text-sm font-semibold">Generated Versions</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {generatedImages.length}
                                </Badge>
                            </div>

                            <div className="flex flex-col-reverse gap-6">
                                {generatedImages.map((imageUrl, index) => (
                                    <div key={imageUrl} className="rounded-lg border border-border bg-card p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-muted-foreground">Version {index + 1}</h4>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = imageUrl;
                                                        link.download = `huenxt-design-v${index + 1}-${Date.now()}.png`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="h-8"
                                                    disabled={isGenerating || refiningImage === imageUrl}
                                                    onClick={() => {
                                                        setRefiningImage(imageUrl);
                                                        setRefinePrompt('');
                                                        setInspirationImages([]);
                                                    }}
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                                    Refine
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="rounded border border-border overflow-hidden bg-muted/20">
                                            <img
                                                src={imageUrl}
                                                alt={`Generated design version ${index + 1}`}
                                                className="w-full h-auto"
                                            />
                                        </div>

                                        {/* Refinement Panel */}
                                        {refiningImage === imageUrl && (
                                            <div className="rounded-lg bg-muted/30 p-4 border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <h4 className="text-sm font-medium">Refining Version {index + 1}</h4>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">Instructions</label>
                                                    <Textarea
                                                        placeholder="How should this version be modified?"
                                                        value={refinePrompt}
                                                        onChange={(e) => setRefinePrompt(e.target.value)}
                                                        className="min-h-[80px] text-sm resize-none"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <InspirationSection
                                                        images={inspirationImages}
                                                        onSelectCategory={() => { }}
                                                        onDeleteImage={handleDeleteImage}
                                                        onClearAll={() => setInspirationImages([])}
                                                        onUpload={handleImageUpload}
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleRefineSubmit(imageUrl)}
                                                        disabled={!refinePrompt && inspirationImages.length === 0}
                                                    >
                                                        Generate Variation
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={cancelRefine}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            {!isGenerating && generatedImages.length > 0 && (
                <div className="p-4 border-t border-border bg-background">
                    <Button
                        className="w-full rounded-full h-11"
                        onClick={onClose}
                    >
                        Done
                    </Button>
                </div>
            )}
        </div>
    );
}
