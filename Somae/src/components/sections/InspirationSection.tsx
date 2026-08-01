import React from 'react';
import { Badge } from "@/components/ui/badge";
import { InspirationUpload } from "@/components/sections/InspirationUpload";
import type { ImageAsset, InspirationCategory } from "@/shared/types";

interface InspirationSectionProps {
    images: ImageAsset[];
    onSelectCategory: (category: InspirationCategory) => void;
    onDeleteImage: (id: string) => void;
    onClearAll: () => void;
    onUpload: (file: File, category: InspirationCategory) => void;
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({
    images,
    onDeleteImage,
    onClearAll,
    onUpload
}) => {
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
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InspirationUpload
                    images={images}
                    onUpload={handleRookieUpload}
                    onDelete={onDeleteImage}
                />
            </div>
        </section>
    );
};
