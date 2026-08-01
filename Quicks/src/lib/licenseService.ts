export interface LicenseRecord {
  licenseKey: string;
  valid: boolean;
  remainingDevices?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const VALIDATE_URL = `${API_BASE_URL}/api/validate-license`;

/**
 * Get or generate a unique device hash for this installation.
 */
function getDeviceHash(): string {
  let hash = localStorage.getItem('quicks_device_hash');
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem('quicks_device_hash', hash);
  }
  return hash;
}

/**
 * Validate a license key against the Next.js backend.
 */
export async function validateLicense(licenseKey: string): Promise<{ valid: boolean; remainingDevices?: number; message?: string }> {
  try {
    const deviceHash = getDeviceHash();
    const deviceName = navigator.userAgent; // Basic device name

    const response = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        device_hash: deviceHash,
        device_name: deviceName,
        browser_info: navigator.userAgent
      }),
    });

    const json = await response.json();

    if (json.valid) {
      // Save locally
      localStorage.setItem('quicks_license_key', licenseKey);
      localStorage.setItem('quicks_license_valid', 'true');
      return { valid: true, remainingDevices: json.remaining_devices };
    } else {
      localStorage.removeItem('quicks_license_valid');
      return { valid: false, message: json.message };
    }
  } catch (err) {
    console.error('[License] validateLicense error:', err);
    // If we have a cached valid status, we might want to return it as a fallback for offline use,
    // but for now let's be strict.
    return { valid: false, message: 'Network error. Could not validate license.' };
  }
}

/**
 * Check if the user is currently licensed based on local storage.
 * This can be used for quick UI checks.
 */
export function isLocallyLicensed(): boolean {
  return localStorage.getItem('quicks_license_valid') === 'true';
}

/**
 * Get the stored license key.
 */
export function getStoredLicenseKey(): string | null {
  return localStorage.getItem('quicks_license_key');
}
