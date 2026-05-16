import React, { useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Shimmer } from "@/components/ui/shimmer";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/shared/types";

interface InspirationUploadProps {
    images: ImageAsset[];
    onUpload: (file: File) => void;
    onDelete: (id: string) => void;
}

export const InspirationUpload: React.FC<InspirationUploadProps> = ({ images, onUpload, onDelete }) => {
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
            let file: File | null = null;

            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                for (let i = 0; i < e.dataTransfer.items.length; i++) {
                    const item = e.dataTransfer.items[i];
                    if (item.kind === 'file' && item.type.startsWith('image/')) {
                        file = item.getAsFile();
                        break;
                    }
                }
            }

            if (!file && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                if (e.dataTransfer.files[0].type.startsWith('image/')) {
                    file = e.dataTransfer.files[0];
                }
            }

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
                        console.error('[InspirationUpload] Failed to fetch dropped image URL:', err);
                    }
                }
            }

            if (file) {
                await new Promise(resolve => setTimeout(resolve, 600));
                onUpload(file);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onUpload(file);
        };
        input.click();
    };

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 border-dashed border-2",
                isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                {isLoading && (
                    <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <Shimmer className="w-full h-full rounded-none" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-medium animate-pulse">Processing...</span>
                        </div>
                    </div>
                )}

                {images.length > 0 ? (
                    <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {images.map(img => (
                                <div key={img.id} className="relative aspect-square group rounded-xl overflow-hidden ring-1 ring-border shadow-sm">
                                    <img src={img.dataUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => onDelete(img.id)}
                                            className="p-1.5 bg-destructive text-white rounded-full hover:scale-110 transition-transform"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleClick}
                                className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                            >
                                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary">Add More</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="cursor-pointer group" onClick={handleClick}>
                        <div className="mb-4 inline-flex p-4 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h4 className="text-sm font-medium mb-1">Upload your inspiration</h4>
                        <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">
                            Drag and drop an image here, or click to browse.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                            <Upload className="w-3 h-3" />
                            <span>Select Image</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
