import { Download, X, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { InspirationSection } from '@/components/sections/InspirationSection';
import type { ImageAsset, InspirationCategory } from '@/shared/types';
import { nanoid } from 'nanoid';

interface GeneratedImageViewProps {
    imageUrl: string;
    designSpec: string;
    onClose: () => void;
    onRegenerate: () => void;
    onRefine: (prompt: string, images: ImageAsset[]) => void;
}

export function GeneratedImageView({
    imageUrl,
    designSpec,
    onClose,
    onRegenerate,
    onRefine,
}: GeneratedImageViewProps) {
    const [isRefining, setIsRefining] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [inspirationImages, setInspirationImages] = useState<ImageAsset[]>([]);
    const [advancedMode, setAdvancedMode] = useState(false);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `somae-design-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const handleRefine = () => {
        onRefine(refinePrompt, inspirationImages);
        setIsRefining(false);
        setRefinePrompt('');
        setInspirationImages([]);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
                <h2 className="text-sm font-semibold tracking-tight">Generated Design</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Generated Image */}
                    <div className="rounded-lg overflow-hidden border border-border bg-muted/20">
                        <img
                            src={imageUrl}
                            alt="Generated design"
                            className="w-full h-auto"
                        />
                    </div>

                    {/* Refine Section */}
                    {isRefining && (
                        <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-border animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-semibold">Refine Design</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Instructions</label>
                                <Textarea
                                    placeholder="Explain how you want to modify this design (e.g., 'Make the headline bigger', 'Use warmer colors')..."
                                    value={refinePrompt}
                                    onChange={(e) => setRefinePrompt(e.target.value)}
                                    className="min-h-[80px] text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <InspirationSection
                                    advancedMode={advancedMode}
                                    onToggleMode={setAdvancedMode}
                                    images={inspirationImages}
                                    onSelectCategory={() => { }} // Category selection not needed for simple upload
                                    onDeleteImage={handleDeleteImage}
                                    onClearAll={() => setInspirationImages([])}
                                    onUpload={handleImageUpload}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleRefine}
                                    disabled={!refinePrompt && inspirationImages.length === 0}
                                >
                                    Generate Variation
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsRefining(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Design Specifications */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Design Recipe
                        </h3>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                            <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/80">
                                {designSpec}
                            </pre>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t border-border bg-background space-y-2">
                {!isRefining ? (
                    <>
                        <Button
                            className="w-full rounded-full h-11"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Image
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                className="w-full rounded-full h-11"
                                onClick={() => setIsRefining(true)}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Refine
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full h-11"
                                onClick={onRegenerate}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-xs text-center text-muted-foreground">
                        Refining design...
                    </p>
                )}
            </div>
        </div>
    );
}
