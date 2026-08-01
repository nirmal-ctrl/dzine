import { v4 as uuidv4 } from 'uuid';

export function generateLicenseKey(): string {
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  const parts = uuid.match(/.{1,4}/g) || [];
  return `QKZ-${parts.slice(0, 4).join('-')}`;
}
