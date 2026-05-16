import { useState, useEffect } from 'react';
import { isLocallyLicensed, getStoredLicenseKey, validateLicense } from '../lib/licenseService';

export interface LicenseInfo {
    valid: boolean;
    remainingDevices: number | null;
    loading: boolean;
    error: string | null;
}

export function useLicense(): LicenseInfo {
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
        valid: isLocallyLicensed(),
        remainingDevices: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function checkLicense() {
            const key = getStoredLicenseKey();
            if (!key) {
                setLicenseInfo({
                    valid: false,
                    remainingDevices: null,
                    loading: false,
                    error: "No license key found",
                });
                return;
            }

            const result = await validateLicense(key);
            setLicenseInfo({
                valid: result.valid,
                remainingDevices: result.remainingDevices ?? null,
                loading: false,
                error: result.message ?? null,
            });
        }

        checkLicense();
    }, []);

    return licenseInfo;
}
