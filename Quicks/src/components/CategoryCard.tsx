import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ImageAsset, InspirationCategory } from "@/shared/types";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/ui/shimmer";

interface CategoryCardProps {
    title: string;
    category: InspirationCategory;
    icon: React.ReactNode;
    description: string;
    images: ImageAsset[];
    onSelect: (category: InspirationCategory) => void;
    onDelete: (id: string) => void;
    onUpload: (file: File, category: InspirationCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    title,
    category,
    icon,
    description,
    images,
    onSelect,
    onDelete,
    onUpload
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dragCounter = React.useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        setIsLoading(true);

        try {
            console.log('[CategoryCard] Drop event detected on:', category);

            let file: File | null = null;

            // 1. Try standard File System drop
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                for (let i = 0; i < e.dataTransfer.items.length; i++) {
                    const item = e.dataTransfer.items[i];
                    if (item.kind === 'file' && item.type.startsWith('image/')) {
                        file = item.getAsFile();
                        break;
                    }
                }
            }

            // Fallback to files list if items failed
            if (!file && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                if (e.dataTransfer.files[0].type.startsWith('image/')) {
                    file = e.dataTransfer.files[0];
                }
            }

            // 2. If no file, try URL/HTML drop (dragging from web)
            if (!file) {
                const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                const html = e.dataTransfer.getData('text/html');

                let src = '';
                if (imageUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl)) {
                    src = imageUrl;
                } else if (html) {
                    const match = html.match(/src="([^"]+)"/);
                    if (match && match[1]) {
                        src = match[1];
                    }
                }

                if (src) {
                    try {
                        const response = await fetch(src);
                        const blob = await response.blob();
                        file = new File([blob], "dropped_image.jpg", { type: blob.type });
                    } catch (err) {
                        console.error('[CategoryCard] Failed to fetch dropped image URL:', err);
                        alert('Could not download dropped image. Try saving it first or picking another.');
                    }
                }
            }

            if (file) {
                // Simulate delay for consistent shimmer effect
                await new Promise(resolve => setTimeout(resolve, 600));
                onUpload(file, category);
            } else {
                // Silently ignore or warn if needed
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            className={cn(
                "overflow-hidden transition-colors border-border/60 relative",
                isDragging ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="p-3 bg-muted/20 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-background rounded-md border border-border/50 shadow-sm text-muted-foreground">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium leading-none mb-0.5">{title}</h3>
                        <p className="text-[10px] text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full"
                    onClick={() => onSelect(category)} // Trigger selection for this category
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            <div className="p-3 relative min-h-[60px]">
                {isLoading && (
                    <div className="absolute inset-0 z-10 p-3 bg-background/50 backdrop-blur-[1px]">
                        <Shimmer className="rounded-md" />
                    </div>
                )}
                {isDragging ? (
                    <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-primary/50 rounded-md bg-background/50 animate-in fade-in duration-200">
                        <Upload className="w-6 h-6 text-primary mb-2" />
                        <span className="text-xs font-medium text-primary">Drop image to upload</span>
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map(img => (
                            <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden ring-1 ring-border/50">
                                <img src={img.dataUrl} className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(img.id);
                                    }}
                                    className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        onClick={() => onSelect(category)}
                        className="h-12 border border-dashed border-border rounded-md flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                        Select an image or drag & drop...
                    </div>
                )}
            </div>
        </Card>
    );
};
