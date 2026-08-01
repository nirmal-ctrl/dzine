import React from 'react';
import { ArrowLeft, ShieldCheck, Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AppConfig } from "@/shared/types";
import type { LicenseInfo } from '@/hooks/useLicense';

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
            localStorage.removeItem('somae_license_valid');
            localStorage.removeItem('somae_license_key');
            window.location.reload();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background p-4 gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
            </div>

            {/* License Section */}
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">License</p>

                {/* License Status */}
                <div className={`flex items-center gap-2 text-xs rounded-md px-2 py-1.5 ${licenseInfo.valid
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
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
                        className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        onClick={handleDeactivate}
                    >
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                        Deactivate License
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={onActivateRequest}
                    >
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                        Activate Pro
                    </Button>
                )}
            </div>
            <Separator />

            {/* API Configuration */}
            <div className="space-y-4 flex-1 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Configuration</p>
                {isVertexAI ? (
                    <>
                        <div className="space-y-2">
                            <Label>Project ID</Label>
                            <Input
                                value={config.projectId || ''}
                                onChange={(e) => onConfigChange({ ...config, projectId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Location (default: us-central1)</Label>
                            <Input
                                value={config.location || 'us-central1'}
                                onChange={(e) => onConfigChange({ ...config, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Google Cloud OAuth Token</Label>
                            <Input
                                type="password"
                                value={config.googleCloudToken || ''}
                                placeholder="OAuth Access Token"
                                onChange={(e) => onConfigChange({ ...config, googleCloudToken: e.target.value })}
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                        value={config.model}
                        onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
                    />
                </div>
            </div>

            <Button className="w-full" onClick={onSave}>Save Configuration</Button>
        </div>
    );
};
