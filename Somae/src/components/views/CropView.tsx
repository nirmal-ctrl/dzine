import React, { useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import type { InspirationCategory } from "@/shared/types";

interface CropViewProps {
    imageSrc: string;
    category: InspirationCategory | null;
    onConfirm: (completedCrop: PixelCrop, imageRef: HTMLImageElement) => void;
    onCancel: () => void;
}

export const CropView: React.FC<CropViewProps> = ({ imageSrc, category, onConfirm, onCancel }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    const handleConfirm = () => {
        if (completedCrop && imgRef.current) {
            onConfirm(completedCrop, imgRef.current);
        } else {
            alert("Please make a selection first.");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                    Crop {category ? category.charAt(0).toUpperCase() + category.slice(1) : ''} Ref
                </h2>
            </div>
            <div className="flex-1 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden border border-border">
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                    <img ref={imgRef} src={imageSrc} className="max-h-[60vh] object-contain" />
                </ReactCrop>
            </div>
            <div className="flex gap-3 mt-4">
                <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
                <Button className="flex-1" onClick={handleConfirm}>Confirm</Button>
            </div>
        </div>
    );
};
