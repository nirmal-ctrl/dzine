import React from 'react';
import { Layout, Palette, Type, Image as ImageIcon, Zap, Rocket } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { CategoryCard } from "@/components/CategoryCard";
import { InspirationUpload } from "@/components/sections/InspirationUpload";
import type { ImageAsset, InspirationCategory } from "@/shared/types";
import { cn } from "@/lib/utils";

interface InspirationSectionProps {
    advancedMode: boolean;
    onToggleMode: (enabled: boolean) => void;
    images: ImageAsset[];
    onSelectCategory: (category: InspirationCategory) => void;
    onDeleteImage: (id: string) => void;
    onClearAll: () => void;
    onUpload: (file: File, category: InspirationCategory) => void;
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({
    advancedMode,
    onToggleMode,
    images,
    onSelectCategory,
    onDeleteImage,
    onClearAll,
    onUpload
}) => {
    const getImages = (cat: InspirationCategory) => images.filter(i => i.category === cat);

    const handleRookieUpload = (file: File) => {
        onUpload(file, 'elements');
    };

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-4 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background text-primary border-primary/20">Step 2</Badge>
                        <h2 className="text-sm font-semibold tracking-tight">Visual Inspiration</h2>
                    </div>
                    {images.length > 0 && (
                        <button
                            onClick={onClearAll}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="flex p-1 bg-muted/50 rounded-lg border border-border/40 w-full max-w-[300px] mx-auto">
                    <button
                        onClick={() => onToggleMode(false)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            !advancedMode
                                ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Zap className={cn("w-3 h-3", !advancedMode ? "text-primary fill-primary/20" : "")} />
                        Rookie
                    </button>
                    <button
                        onClick={() => onToggleMode(true)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            advancedMode
                                ? "bg-background text-primary shadow-sm ring-1 ring-border/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Rocket className={cn("w-3 h-3", advancedMode ? "text-primary fill-primary/20" : "")} />
                        Champion
                    </button>
                </div>
            </div>

            {advancedMode ? (
                <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CategoryCard
                        title="Layout"
                        category="layout"
                        icon={<Layout className="w-3.5 h-3.5" />}
                        description="Structure & Composition"
                        images={getImages('layout')}
                        onSelect={onSelectCategory}
                        onDelete={onDeleteImage}
                        onUpload={onUpload}
                    />
                    <CategoryCard
                        title="Color"
                        category="color"
                        icon={<Palette className="w-3.5 h-3.5" />}
                        description="Palette & Mood"
                        images={getImages('color')}
                        onSelect={onSelectCategory}
                        onDelete={onDeleteImage}
                        onUpload={onUpload}
                    />
                    <CategoryCard
                        title="Typography"
                        category="typography"
                        icon={<Type className="w-3.5 h-3.5" />}
                        description="Fonts & Hierarchy"
                        images={getImages('typography')}
                        onSelect={onSelectCategory}
                        onDelete={onDeleteImage}
                        onUpload={onUpload}
                    />
                    <CategoryCard
                        title="Elements"
                        category="elements"
                        icon={<ImageIcon className="w-3.5 h-3.5" />}
                        description="Shapes & UI Graphics"
                        images={getImages('elements')}
                        onSelect={onSelectCategory}
                        onDelete={onDeleteImage}
                        onUpload={onUpload}
                    />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <InspirationUpload
                        images={images}
                        onUpload={handleRookieUpload}
                        onDelete={onDeleteImage}
                    />
                </div>
            )}
        </section>
    );
};
