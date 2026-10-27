/**
 * s9e/TextFormatter's MediaEmbed plugin renders an `<iframe src="...">`
 * pointing at each provider's *embed player* URL (e.g.
 * `https://www.youtube-nocookie.com/embed/<id>` or
 * `https://player.vimeo.com/video/<id>`), not at the page a visitor would
 * normally browse to. Some embed-player URLs refuse to render anything
 * useful when opened directly as a top-level page (outside of an iframe) —
 * notably YouTube's, which can show "Video unavailable" depending on the
 * uploader's embedding restrictions.
 *
 * This resolves the embed `src` back to the regular, shareable page for a
 * handful of well-known providers, so the banner's source link actually
 * works for visitors who don't want to grant consent. Providers not listed
 * here fall back to the raw embed `src`, which is usually still a live page
 * even if it isn't the "canonical" one.
 */
type CanonicalUrlResolver = (embedSrc: string) => string | null;

const CANONICAL_URL_RESOLVERS: Record<string, CanonicalUrlResolver> = {
  youtube: (embedSrc) => {
    const match = embedSrc.match(/youtube(?:-nocookie)?\.com\/embed\/([-\w]+)/i);
    if (!match) {
      return null;
    }

    return `https://www.youtube.com/watch?v=${match[1]}`;
  },
  vimeo: (embedSrc) => {
    const match = embedSrc.match(/player\.vimeo\.com\/video\/(\d+)/i);
    if (!match) {
      return null;
    }

    return `https://vimeo.com/${match[1]}`;
  },
};

/**
 * Returns the URL that should be linked to from the click-to-view banner:
 * the canonical page for the given provider if one can be derived from the
 * embed's `src`, or the embed `src` itself as a fallback.
 */
export function resolveSourceUrl(site: string, embedSrc: string): string {
  return CANONICAL_URL_RESOLVERS[site]?.(embedSrc) ?? embedSrc;
}
