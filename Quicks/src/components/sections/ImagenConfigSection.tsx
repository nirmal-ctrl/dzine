import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImagenConfig } from '@/shared/types';
import { getAspectRatioForPlatform } from '@/utils/imagenPromptBuilder';

interface ImagenConfigSectionProps {
    config: ImagenConfig;
    onChange: (config: ImagenConfig) => void;
    platform: string;
}

export function ImagenConfigSection({ config, onChange, platform }: ImagenConfigSectionProps) {
    const updateConfig = (key: keyof ImagenConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    // Get recommended aspect ratio for current platform
    const recommendedRatio = getAspectRatioForPlatform(platform);

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Badge variant="outline" className="bg-background text-primary border-primary/20">Step 4</Badge>
                <h2 className="text-sm font-semibold tracking-tight">Generation Settings</h2>
            </div>

            <div className="space-y-4">
                {/* Model Selection */}
                <div className="space-y-2">
                    <Label htmlFor="model" className="text-xs font-medium text-muted-foreground">
                        AI Model
                    </Label>
                    <Select
                        value={config.model}
                        onValueChange={(value) => updateConfig('model', value)}
                    >
                        <SelectTrigger id="model" className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="imagen-4.0">Imagen 4.0 - Photorealistic</SelectItem>
                            <SelectItem value="gemini-3-pro-image">Gemini 3 Pro - Creative & Artistic</SelectItem>
                            <SelectItem value="nano-banana-2">Nano Banana 2 - Fast & Quirky</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {config.model === 'imagen-4.0'
                            ? 'Perfect for realistic photos and product images'
                            : config.model === 'nano-banana-2'
                                ? 'Fast, fun and quirky generations with the Banana architecture'
                                : 'Great for creative designs, illustrations, and artistic styles'}
                    </p>
                </div>

                {/* Number of Images */}
                <div className="space-y-2">
                    <Label htmlFor="numberOfImages" className="text-xs font-medium text-muted-foreground">
                        How many variations?
                    </Label>
                    <Select
                        value={String(config.numberOfImages)}
                        onValueChange={(value) => updateConfig('numberOfImages', parseInt(value))}
                    >
                        <SelectTrigger id="numberOfImages" className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 design</SelectItem>
                            <SelectItem value="2">2 designs</SelectItem>
                            <SelectItem value="3">3 designs</SelectItem>
                            <SelectItem value="4">4 designs</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Generate multiple options to choose from
                    </p>
                </div>

                {/* Image Size */}
                <div className="space-y-2">
                    <Label htmlFor="imageSize" className="text-xs font-medium text-muted-foreground">
                        Image Resolution
                    </Label>
                    <Select
                        value={config.imageSize}
                        onValueChange={(value) => updateConfig('imageSize', value)}
                    >
                        <SelectTrigger id="imageSize" className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1K">Good (1024px) - Faster</SelectItem>
                            <SelectItem value="2K">Better (2048px) - Balanced</SelectItem>
                            {(config.model === 'gemini-3-pro-image' || config.model === 'nano-banana-2') && (
                                <SelectItem value="4K">Best (4096px) - Highest Quality</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {config.imageSize === '4K'
                            ? 'Ultra high resolution - perfect for printing and detailed work'
                            : config.imageSize === '2K'
                                ? 'High quality - great for most social media and web use'
                                : 'Standard quality - quick generation for previews'}
                    </p>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                    <Label htmlFor="aspectRatio" className="text-xs font-medium text-muted-foreground">
                        Aspect Ratio
                    </Label>
                    <Select
                        value={config.aspectRatio}
                        onValueChange={(value) => updateConfig('aspectRatio', value)}
                    >
                        <SelectTrigger id="aspectRatio" className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">
                                <div className="flex items-center gap-2">
                                    <span>Auto (based on platform)</span>
                                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                </div>
                            </SelectItem>
                            <SelectItem value="1:1">
                                <div className="flex items-center gap-2">
                                    <span>Square (1:1)</span>
                                    {recommendedRatio === '1:1' && (
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    )}
                                </div>
                            </SelectItem>
                            <SelectItem value="3:4">
                                <div className="flex items-center gap-2">
                                    <span>Portrait (3:4)</span>
                                    {recommendedRatio === '3:4' && (
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    )}
                                </div>
                            </SelectItem>
                            <SelectItem value="4:3">
                                <div className="flex items-center gap-2">
                                    <span>Landscape (4:3)</span>
                                    {recommendedRatio === '4:3' && (
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    )}
                                </div>
                            </SelectItem>
                            <SelectItem value="9:16">
                                <div className="flex items-center gap-2">
                                    <span>Story (9:16)</span>
                                    {recommendedRatio === '9:16' && (
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    )}
                                </div>
                            </SelectItem>
                            <SelectItem value="16:9">
                                <div className="flex items-center gap-2">
                                    <span>Wide (16:9)</span>
                                    {recommendedRatio === '16:9' && (
                                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                    )}
                                </div>
                            </SelectItem>
                            {(config.model === 'gemini-3-pro-image' || config.model === 'nano-banana-2') && (
                                <>
                                    <SelectItem value="3:2">3:2</SelectItem>
                                    <SelectItem value="2:3">2:3</SelectItem>
                                    <SelectItem value="4:5">4:5</SelectItem>
                                    <SelectItem value="5:4">5:4</SelectItem>
                                    <SelectItem value="21:9">Ultra Wide (21:9)</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Person Generation */}
                <div className="space-y-2">
                    <Label htmlFor="personGeneration" className="text-xs font-medium text-muted-foreground">
                        Include People?
                    </Label>
                    <Select
                        value={config.personGeneration}
                        onValueChange={(value) => updateConfig('personGeneration', value)}
                    >
                        <SelectTrigger id="personGeneration" className="text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dont_allow">No people</SelectItem>
                            <SelectItem value="allow_adult">Adults only</SelectItem>
                            <SelectItem value="allow_all">Adults & children</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Control whether people appear in your designs
                    </p>
                </div>

                {/* Advanced Creative Settings */}
                {(config.model === 'gemini-3-pro-image' || config.model === 'nano-banana-2') && (
                    <>
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-3">
                                {config.model === 'nano-banana-2' ? 'Banana Config' : 'Creative Controls'}
                            </p>
                        </div>

                        {/* Temperature */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="temperature" className="text-xs font-medium text-muted-foreground">
                                    Creativity Level
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {config.temperature?.toFixed(1) ?? '1.0'}
                                </span>
                            </div>
                            <input
                                id="temperature"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={config.temperature ?? 1.0}
                                onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Precise</span>
                                <span>Balanced</span>
                                <span>Wild</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Higher = more unexpected and creative results
                            </p>
                        </div>

                        {/* Top P */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="topP" className="text-xs font-medium text-muted-foreground">
                                    Variety
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {config.topP?.toFixed(2) ?? '0.95'}
                                </span>
                            </div>
                            <input
                                id="topP"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={config.topP ?? 0.95}
                                onChange={(e) => updateConfig('topP', parseFloat(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Focused</span>
                                <span>Diverse</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Controls how much variety in the output
                            </p>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
