import { transformEmbedsHtml } from '../../../src/common/clickToView/transform';

const youtubeEmbedHtml =
  '<p>Check this out:</p>' +
  '<span data-s9e-mediaembed="youtube" style="display:inline-block;width:100%;max-width:640px">' +
  '<span style="display:block;overflow:hidden;position:relative;padding-bottom:56.25%">' +
  '<iframe allowfullscreen="" loading="lazy" style="background:url(https://i.ytimg.com/vi/abc123/hqdefault.jpg) 50% 50% / cover;border:0;height:100%;left:0;position:absolute;width:100%" src="https://www.youtube.com/embed/abc123"></iframe>' +
  '</span>' +
  '</span>';

// "Full width" sites (SoundCloud, Spotify, Mixcloud, CodePen, etc. —
// anything s9e configures with `width="100%"`) skip the wrapping `<span>`
// entirely: `data-s9e-mediaembed` sits directly on the `<iframe>`.
const soundcloudEmbedHtml =
  '<p>Listen:</p>' +
  '<iframe data-s9e-mediaembed="soundcloud" allowfullscreen="" loading="lazy" scrolling="no" style="height:166px;max-width:900px;width:100%" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/artist/track"></iframe>';

const bannerContent = (site: string) => ({
  message: `message:${site}`,
  buttonLabel: `button:${site}`,
  sourceLinkLabel: `link:${site}`,
});

describe('transformEmbedsHtml', () => {
  it('returns non-embed html unchanged', () => {
    const html = '<p>No embeds here.</p>';

    expect(transformEmbedsHtml(html, bannerContent)).toBe(html);
  });

  it('returns an empty string for null/undefined input', () => {
    expect(transformEmbedsHtml(null, bannerContent)).toBe('');
    expect(transformEmbedsHtml(undefined, bannerContent)).toBe('');
  });

  it('strips the iframe src and wraps the embed with a generic click-to-view banner', () => {
    const result = transformEmbedsHtml(youtubeEmbedHtml, bannerContent);
    const doc = new DOMParser().parseFromString(result, 'text/html');

    const wrapper = doc.querySelector('.ClickToView');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-ctv-site')).toBe('youtube');

    const iframe = doc.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBeNull();
    expect(iframe?.getAttribute('data-ctv-src')).toBe('https://www.youtube.com/embed/abc123');

    const embedContainer = doc.querySelector('.ClickToView-embed');
    expect(embedContainer?.hasAttribute('hidden')).toBe(true);
    expect(embedContainer?.contains(iframe)).toBe(true);

    // The banner itself is a plain, generic box — no inline sizing/thumbnail
    // copied from the original embed.
    const banner = doc.querySelector('.ClickToView-banner');
    expect(banner?.getAttribute('style')).toBeNull();
    expect(banner?.classList.contains('ClickToView-banner--thumbnail')).toBe(false);
  });

  it('renders the provided banner message, button label and source link', () => {
    const result = transformEmbedsHtml(youtubeEmbedHtml, bannerContent);
    const doc = new DOMParser().parseFromString(result, 'text/html');

    expect(doc.querySelector('.ClickToView-banner-message')?.textContent).toBe('message:youtube');
    expect(doc.querySelector('.ClickToView-banner-button')?.textContent).toBe('button:youtube');

    const link = doc.querySelector<HTMLAnchorElement>('.ClickToView-banner-link');
    expect(link?.textContent).toBe('link:youtube');
    expect(link?.getAttribute('href')).toBe('https://www.youtube.com/embed/abc123');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('nofollow noopener noreferrer');
  });

  it('leaves embeds without an iframe untouched', () => {
    const html = '<span data-s9e-mediaembed="weird"><em>no iframe here</em></span>';

    expect(transformEmbedsHtml(html, bannerContent)).toBe(html);
  });

  it('strips the src and wraps "full width" embeds whose iframe itself carries data-s9e-mediaembed', () => {
    const result = transformEmbedsHtml(soundcloudEmbedHtml, bannerContent);
    const doc = new DOMParser().parseFromString(result, 'text/html');

    const wrapper = doc.querySelector('.ClickToView');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-ctv-site')).toBe('soundcloud');

    const iframe = doc.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBeNull();
    expect(iframe?.getAttribute('data-ctv-src')).toBe('https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/artist/track');
    // The iframe's own sizing style must survive, since there's no separate
    // wrapper span to carry it once the embed is revealed.
    expect(iframe?.getAttribute('style')).toContain('width:100%');

    const embedContainer = doc.querySelector('.ClickToView-embed');
    expect(embedContainer?.hasAttribute('hidden')).toBe(true);
    expect(embedContainer?.contains(iframe)).toBe(true);

    expect(doc.querySelector('.ClickToView-banner-message')?.textContent).toBe('message:soundcloud');
  });
});
