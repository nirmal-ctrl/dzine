import { useState } from 'react';
import { Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateLicense } from '@/lib/licenseService';

interface LicenseViewProps {
  onSuccess: () => void;
}

export function LicenseView({ onSuccess }: LicenseViewProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setError('');
    setLoading(true);

    try {
      const result = await validateLicense(licenseKey.trim());
      if (result.valid) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(result.message || 'Invalid license key.');
      }
    } catch (err) {
      setError('Failed to connect to validation server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-col items-center gap-3 pt-10 pb-6 px-6 border-b border-border">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-base font-semibold tracking-tight">Activate Huenxt Pro</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Enter your license key to unlock premium features</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 pt-10">
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <p>License activated successfully!</p>
          </div>
        )}

        <form onSubmit={handleActivate} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Input
              placeholder="QKZ-XXXX-XXXX-XXXX-XXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              disabled={loading || success}
              className="h-10 text-sm font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Don't have a license? <a href="http://localhost:3000/pricing" target="_blank" rel="noreferrer" className="text-primary hover:underline">Buy one here</a>
            </p>
          </div>

          <Button 
            type="submit"
            disabled={loading || success || !licenseKey.trim()} 
            className="w-full h-10 text-sm font-medium"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : 'Activate License'}
          </Button>
        </form>
      </div>

      <div className="mt-auto pb-6 px-6 pt-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          Your license key is sent to your email after purchase.
          <br />One license works on up to 2 devices.
        </p>
      </div>
    </div>
  );
}
