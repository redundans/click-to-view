/**
 * Text to render inside a click-to-view banner for a given provider.
 */
export interface ClickToViewBannerContent {
  message: string;
  buttonLabel: string;
  sourceLinkLabel: string;
}

type BannerContentProvider = (site: string) => ClickToViewBannerContent;

const MEDIA_EMBED_SELECTOR = '[data-s9e-mediaembed]';

/**
 * Replaces every oembed rendered by s9e/TextFormatter's MediaEmbed plugin
 * (identified by its `data-s9e-mediaembed` attribute) with an inert,
 * generic 16:9 click-to-view banner.
 */
export function transformEmbedsHtml(html: string | null | undefined, getBannerContent: BannerContentProvider): string {
  if (!html || !html.includes('data-s9e-mediaembed')) {
    return html || '';
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const embeds = Array.from(doc.body.querySelectorAll<HTMLElement>(MEDIA_EMBED_SELECTOR));

  embeds.forEach((embed) => {
    const site = embed.dataset.s9eMediaembed;
    const iframe = embed.tagName === 'IFRAME' ? (embed as HTMLIFrameElement) : embed.querySelector('iframe');

    if (!site || !iframe) {
      return;
    }

    const src = iframe.getAttribute('src');
    if (!src) {
      return;
    }

    iframe.setAttribute('data-ctv-src', src);
    iframe.removeAttribute('src');

    const { message, buttonLabel, sourceLinkLabel } = getBannerContent(site);

    const wrapper = doc.createElement('span');
    wrapper.className = 'ClickToView';
    wrapper.setAttribute('data-ctv-site', site);

    const embedContainer = doc.createElement('span');
    embedContainer.className = 'ClickToView-embed';
    embedContainer.hidden = true;

    const banner = doc.createElement('span');
    banner.className = 'ClickToView-banner';

    const content = doc.createElement('span');
    content.className = 'ClickToView-banner-content';

    const messageEl = doc.createElement('span');
    messageEl.className = 'ClickToView-banner-message';
    messageEl.textContent = message;

    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'Button Button--primary ClickToView-banner-button';
    button.setAttribute('data-ctv-action', 'reveal');
    button.textContent = buttonLabel;

    const sourceLink = doc.createElement('a');
    sourceLink.className = 'ClickToView-banner-link';
    sourceLink.href = src;
    sourceLink.target = '_blank';
    sourceLink.rel = 'nofollow noopener noreferrer';
    sourceLink.textContent = sourceLinkLabel;

    content.appendChild(messageEl);
    content.appendChild(button);
    content.appendChild(sourceLink);
    banner.appendChild(content);

    embed.replaceWith(wrapper);
    wrapper.appendChild(embedContainer);
    embedContainer.appendChild(embed);
    wrapper.appendChild(banner);
  });

  return doc.body.innerHTML;
}
