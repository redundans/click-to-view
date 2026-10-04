import { grantConsent, hasConsent } from '../../common/clickToView/consent';

const WRAPPER_SELECTOR = '.ClickToView[data-ctv-site]';
const BUTTON_SELECTOR = '.ClickToView-banner-button';

/**
 * Reveals a click-to-view wrapper: restores the iframe's `src` so it actually
 * loads, hides the banner, and shows the (now-active) embed.
 */
function revealEmbed(wrapper: HTMLElement): void {
  if (wrapper.dataset.ctvRevealed === 'true') {
    return;
  }

  const embedContainer = wrapper.querySelector<HTMLElement>('.ClickToView-embed');
  const banner = wrapper.querySelector<HTMLElement>('.ClickToView-banner');
  const iframe = embedContainer?.querySelector<HTMLIFrameElement>('iframe[data-ctv-src]');

  if (iframe) {
    const src = iframe.getAttribute('data-ctv-src');
    if (src) {
      iframe.setAttribute('src', src);
    }
    iframe.removeAttribute('data-ctv-src');
  }

  if (embedContainer) {
    embedContainer.hidden = false;
  }
  if (banner) {
    banner.hidden = true;
  }

  wrapper.dataset.ctvRevealed = 'true';
}

/**
 * Reveals any click-to-view embeds within `root` for which the visitor has
 * already granted consent (remembered per-provider), so repeat visits — or
 * newly rendered posts embedding an already-approved provider — don't
 * require clicking through the banner again.
 */
export function applyStoredConsent(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(WRAPPER_SELECTOR).forEach((wrapper) => {
    const site = wrapper.dataset.ctvSite;
    if (site && hasConsent(site)) {
      revealEmbed(wrapper);
    }
  });
}

let delegationBound = false;

/**
 * Binds a single, document-level delegated click handler for all
 * click-to-view banner buttons. Safe to call repeatedly; only binds once.
 */
export function bindClickToViewDelegation(): void {
  if (delegationBound) {
    return;
  }
  delegationBound = true;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>(BUTTON_SELECTOR);
    if (!button) {
      return;
    }

    const wrapper = button.closest<HTMLElement>(WRAPPER_SELECTOR);
    const site = wrapper?.dataset.ctvSite;
    if (!wrapper || !site) {
      return;
    }

    event.preventDefault();

    grantConsent(site);
    revealEmbed(wrapper);
  });
}
