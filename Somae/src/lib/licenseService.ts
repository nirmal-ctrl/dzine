export interface LicenseRecord {
  licenseKey: string;
  valid: boolean;
  remainingDevices?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const VALIDATE_URL = `${API_BASE_URL}/api/validate-license`;
const DEVICE_HASH_KEY = 'huenxt_device_hash';
const LEGACY_DEVICE_HASH_KEY = 'somae_device_hash';
const LICENSE_KEY = 'huenxt_license_key';
const LEGACY_LICENSE_KEY = 'somae_license_key';
const LICENSE_VALID_KEY = 'huenxt_license_valid';
const LEGACY_LICENSE_VALID_KEY = 'somae_license_valid';

/**
 * Get or generate a unique device hash for this installation.
 */
function getDeviceHash(): string {
  let hash = localStorage.getItem(DEVICE_HASH_KEY) || localStorage.getItem(LEGACY_DEVICE_HASH_KEY);
  if (!hash) {
    hash = crypto.randomUUID();
  }
  localStorage.setItem(DEVICE_HASH_KEY, hash);
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
      localStorage.setItem(LICENSE_KEY, licenseKey);
      localStorage.setItem(LICENSE_VALID_KEY, 'true');
      return { valid: true, remainingDevices: json.remaining_devices };
    } else {
      localStorage.removeItem(LICENSE_VALID_KEY);
      localStorage.removeItem(LEGACY_LICENSE_VALID_KEY);
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
  return localStorage.getItem(LICENSE_VALID_KEY) === 'true' || localStorage.getItem(LEGACY_LICENSE_VALID_KEY) === 'true';
}

/**
 * Get the stored license key.
 */
export function getStoredLicenseKey(): string | null {
  const licenseKey = localStorage.getItem(LICENSE_KEY) || localStorage.getItem(LEGACY_LICENSE_KEY);
  if (licenseKey) {
    localStorage.setItem(LICENSE_KEY, licenseKey);
  }
  return licenseKey;
}
