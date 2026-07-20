import React, { useState } from 'react';
import { Wand2, Key, ExternalLink, Loader2, CheckCircle, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import type { User } from 'firebase/auth';
import { validateLicense } from '@/lib/licenseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaywallViewProps {
    user: User;
    onLicensed: () => void;
}

// Replace with your actual LemonSqueezy / Gumroad checkout URL
const PURCHASE_URL = 'https://YOUR_STORE.lemonsqueezy.com/checkout/YOUR_PRODUCT_ID';

export function PaywallView({ user, onLicensed }: PaywallViewProps) {
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [activated, setActivated] = useState(false);
    const [error, setError] = useState('');

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!licenseKey.trim()) return;
        setError('');
        setLoading(true);

        const result = await validateLicense(licenseKey.trim());

        if (result.valid) {
            setActivated(true);
            setTimeout(onLicensed, 1800);
        } else {
            setError(result.message ?? 'Activation failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 pt-8 pb-5 px-6 border-b border-border">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                    <h1 className="text-base font-semibold tracking-tight">Quicks Design</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Lifetime License</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Pricing Card */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">$300</span>
                        <span className="text-xs text-muted-foreground">one-time</span>
                    </div>

                    <div className="space-y-2">
                        {[
                            { icon: Zap, text: 'Unlimited AI design generation' },
                            { icon: RefreshCw, text: 'All updates included for 2 years' },
                            { icon: ShieldCheck, text: 'Single user license' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                                {text}
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-full h-9 text-sm gap-2"
                        onClick={() => chrome.tabs?.create({ url: PURCHASE_URL }) ?? window.open(PURCHASE_URL, '_blank')}
                    >
                        Buy License
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-2 bg-background text-xs text-muted-foreground">Already purchased?</span>
                    </div>
                </div>

                {/* Activate Section */}
                {activated ? (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <p className="text-sm font-medium text-green-600">License Activated!</p>
                        <p className="text-xs text-muted-foreground">Opening Quicks Design…</p>
                    </div>
                ) : (
                    <form onSubmit={handleActivate} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs" htmlFor="license-key">License Key</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    id="license-key"
                                    className="pl-9 text-sm h-9 font-mono tracking-wider"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="outline"
                            disabled={loading || !licenseKey.trim()}
                            className="w-full h-9 text-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {loading ? 'Activating...' : 'Activate License'}
                        </Button>
                    </form>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    Signed in as <span className="font-medium text-foreground">{user.email}</span>
                </p>
            </div>
        </div>
    );
}
