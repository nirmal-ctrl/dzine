import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BrandProfile } from '@/shared/types';

interface BrandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand: BrandProfile;
    onSave: (brand: BrandProfile) => void;
}

/**
 * Brand setup — upload the logo once, name the brand.
 * Persisted and reused automatically for every generation.
 */
export function BrandDialog({ open, onOpenChange, brand, onSave }: BrandDialogProps) {
    // Dialog content unmounts when closed, so state re-initializes from
    // the persisted brand each time the dialog opens.
    const [name, setName] = useState(brand.name);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(brand.logoDataUrl);
    const [reading, setReading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        setReading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoDataUrl((e.target?.result as string) ?? null);
            setReading(false);
        };
        reader.onerror = () => setReading(false);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        onSave({
            name: name.trim(),
            logoDataUrl,
            updatedAt: Date.now(),
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="text-base">Your Brand</DialogTitle>
                    <DialogDescription className="text-xs">
                        Upload your logo once — Somae will use it intelligently in every design.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Logo uploader */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Logo</Label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-input bg-muted/40 transition-colors hover:border-somae-blue/50 hover:bg-somae-blue-tint"
                            >
                                {reading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : logoDataUrl ? (
                                    <img
                                        src={logoDataUrl}
                                        alt="Brand logo"
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                )}
                            </button>
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full text-xs"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {logoDataUrl ? 'Replace logo' : 'Upload logo'}
                                </Button>
                                {logoDataUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => setLogoDataUrl(null)}
                                    >
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                                e.target.value = '';
                            }}
                        />
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            PNG with a transparent background works best. Your logo is preserved
                            exactly as uploaded — never redesigned.
                        </p>
                    </div>

                    {/* Brand name */}
                    <div className="space-y-2">
                        <Label htmlFor="brand-name" className="text-xs font-medium text-muted-foreground">
                            Brand name
                        </Label>
                        <Input
                            id="brand-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Asoma"
                            className="h-9 text-sm"
                            maxLength={40}
                        />
                    </div>

                    <Button
                        type="button"
                        className="h-10 w-full bg-somae-blue text-white hover:bg-somae-blue-dark"
                        onClick={handleSave}
                    >
                        Save Brand
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
