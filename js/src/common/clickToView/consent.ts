const STORAGE_KEY = 'redundans-click-to-view-consent';

type ConsentMap = Record<string, boolean>;

function readConsent(): ConsentMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as ConsentMap) : {};
  } catch {
    return {};
  }
}

/**
 * Whether the visitor has already consented to loading embeds from the given
 * provider (e.g. `youtube`, `vimeo`). Consent is remembered per-provider, so
 * accepting one provider's embeds does not implicitly consent to others.
 */
export function hasConsent(site: string): boolean {
  return readConsent()[site] === true;
}

/**
 * Remembers that the visitor has consented to loading embeds from the given
 * provider. Fails silently if `localStorage` is unavailable (e.g. private
 * browsing with storage disabled) — consent simply won't persist in that case.
 */
export function grantConsent(site: string): void {
  const consent = readConsent();
  consent[site] = true;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Ignore: consent won't be remembered across reloads in this case.
  }
}
