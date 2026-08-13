import React from 'react';
import { ArrowLeft, ShieldCheck, Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppConfig } from "@/shared/types";
import type { LicenseInfo } from '@/hooks/useLicense';
import { Logo } from '@/components/somae/Logo';

interface SettingsViewProps {
    config: AppConfig;
    onConfigChange: (config: AppConfig) => void;
    onSave: () => void;
    onBack: () => void;
    licenseInfo: LicenseInfo;
    onActivateRequest: () => void;
}

// Check for Vertex AI mode
const isVertexAI = import.meta.env.VITE_IS_NOT_API_ACCESS === 'true';

export const SettingsView: React.FC<SettingsViewProps> = ({
    config, onConfigChange, onSave, onBack, licenseInfo, onActivateRequest
}) => {

    const handleDeactivate = () => {
        if (confirm('Are you sure you want to deactivate this license on this device?')) {
            localStorage.removeItem('huenxt_license_valid');
            localStorage.removeItem('huenxt_license_key');
            localStorage.removeItem('somae_license_valid');
            localStorage.removeItem('somae_license_key');
            window.location.reload();
        }
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-semibold tracking-tight">Settings</h2>
                <div className="ml-auto">
                    <Logo tone="dark" showBadge={false} className="scale-90" />
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 scrollbar-thin">
                {/* License Section */}
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-card">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        License
                    </p>

                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${licenseInfo.valid
                        ? 'border-green-500/20 bg-green-500/10 text-green-700'
                        : 'border-amber-500/20 bg-amber-500/10 text-amber-700'
                        }`}>
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">{licenseInfo.valid ? 'Somae Pro' : 'Free Version'}</span>
                        {licenseInfo.valid && licenseInfo.remainingDevices !== null && (
                            <span className="ml-auto text-muted-foreground">
                                {licenseInfo.remainingDevices} devices left
                            </span>
                        )}
                    </div>

                    {licenseInfo.valid ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-full text-xs text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                            onClick={handleDeactivate}
                        >
                            <Key className="mr-1.5 h-3.5 w-3.5" />
                            Deactivate License
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="h-8 w-full bg-somae-blue text-xs text-white hover:bg-somae-blue-dark"
                            onClick={onActivateRequest}
                        >
                            <Key className="mr-1.5 h-3.5 w-3.5" />
                            Activate Pro
                        </Button>
                    )}
                </div>

                {/* API Configuration */}
                <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        API Configuration
                    </p>

                    {isVertexAI ? (
                        <>
                            <div className="space-y-2">
                                <Label className="text-xs">Project ID</Label>
                                <Input
                                    className="h-9 text-sm"
                                    value={config.projectId || ''}
                                    onChange={(e) => onConfigChange({ ...config, projectId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Location (default: us-central1)</Label>
                                <Input
                                    className="h-9 text-sm"
                                    value={config.location || 'us-central1'}
                                    onChange={(e) => onConfigChange({ ...config, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Google Cloud OAuth Token</Label>
                                <Input
                                    className="h-9 text-sm"
                                    type="password"
                                    value={config.googleCloudToken || ''}
                                    placeholder="OAuth Access Token"
                                    onChange={(e) => onConfigChange({ ...config, googleCloudToken: e.target.value })}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-xs">API Key</Label>
                            <Input
                                className="h-9 text-sm"
                                type="password"
                                value={config.apiKey}
                                placeholder="Google AI Studio API key"
                                onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs">Text Model (Smart Prompt)</Label>
                        <Input
                            className="h-9 text-sm"
                            value={config.model}
                            onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Image Engine</Label>
                        <Select
                            value={config.imageEngine ?? 'gemini'}
                            onValueChange={(value) =>
                                onConfigChange({ ...config, imageEngine: value as AppConfig['imageEngine'] })
                            }
                        >
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini">
                                    Gemini 3 Pro Image — uses logo & reference
                                </SelectItem>
                                <SelectItem value="imagen">
                                    Imagen 4.0 — text-only, photorealistic
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Gemini 3 Pro Image is recommended — it can use your uploaded logo and
                            reference image. Imagen 4.0 generates from text only.
                        </p>
                    </div>
                </div>
            </div>

            <div className="shrink-0 border-t border-border bg-background p-4">
                <Button
                    className="h-10 w-full bg-somae-blue text-white hover:bg-somae-blue-dark"
                    onClick={onSave}
                >
                    Save Configuration
                </Button>
            </div>
        </div>
    );
};
