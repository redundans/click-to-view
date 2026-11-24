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
 * Many providers are rendered through s9e's hosted iframe pages, e.g.
 * `https://s9e.github.io/iframe/2/instagram.min.html#<id>`. The part after the
 * first `#` encodes the media's attributes (any further `#...` is s9e's own
 * options such as `#theme=dark`). These resolvers turn that payload back into
 * the provider's public page; a resolver returns null if it can't.
 */
type S9eResolver = (payload: string) => string | null;

const S9E_IFRAME_PATTERN = /^(?:https?:)?\/\/s9e\.github\.io\/iframe\/2\/([-\w]+)\.min\.html#([^#]+)/i;

const S9E_RESOLVERS: Record<string, S9eResolver> = {
  instagram: (id) => (/^[-\w]+$/.test(id) ? `https://www.instagram.com/p/${id}/` : null),

  twitter: (id) => (/^\d+$/.test(id) ? `https://x.com/i/status/${id}` : null),

  threads: (id) => (/^[-\w]+$/.test(id) ? `https://www.threads.com/t/${id}` : null),

  tiktok: (id) => (/^\d+$/.test(id) ? `https://www.tiktok.com/@/video/${id}` : null),

  telegram: (id) => (/^\w+\/\d+$/.test(id) ? `https://t.me/${id}` : null),

  // `<name>/<id>` on mastodon.social, otherwise `<name>@<host>/<id>`.
  mastodon: (payload) => {
    const match = payload.match(/^(\w+)(?:@([-.\w]+))?\/(\d+)$/);
    if (!match) {
      return null;
    }

    return `https://${match[2] ?? 'mastodon.social'}/@${match[1]}/${match[3]}`;
  },

  // The payload is the URL-encoded AT URI: at://<did>/app.bsky.feed.post/<rkey>
  bluesky: (payload) => {
    let uri = payload;
    try {
      for (let i = 0; i < 2 && uri.includes('%'); i++) {
        uri = decodeURIComponent(uri);
      }
    } catch {
      return null;
    }

    const match = uri.match(/^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([-\w]+)$/);
    if (!match) {
      return null;
    }

    return `https://bsky.app/profile/${match[1]}/post/${match[2]}`;
  },

  // `<user>/posts/<id>`, `<user>/videos/<id>`, or `<type><id>` where type is
  // p (post), v (video), r (reel) or empty.
  facebook: (payload) => {
    if (/^[.\w]+\/(?:post|video)s\/\w+$/.test(payload)) {
      return `https://www.facebook.com/${payload}`;
    }

    const match = payload.match(/^([pvr]?)(\d+)$/);
    if (!match) {
      return null;
    }

    switch (match[1]) {
      case 'v':
        return `https://www.facebook.com/watch/?v=${match[2]}`;
      case 'r':
        return `https://www.facebook.com/reel/${match[2]}`;
      default:
        return `https://www.facebook.com/${match[2]}`;
    }
  },

  // `<subreddit>/comments/<id>[/<slug>/<comment>]`
  reddit: (id) => (/^\w+\/comments\/\w+(?:\/\w+\/\w+)?$/.test(id) ? `https://www.reddit.com/r/${id}/` : null),

  // `<id>` or `a/<id>` for albums (an album id may itself be `a/...` or `gallery/...`).
  imgur: (id) => {
    const path = id.replace(/^a\/(?=(?:a|gallery)\/)/, '');

    return /^(?:(?:a|gallery)\/)?\w+$/.test(path) ? `https://imgur.com/${path}` : null;
  },

  gist: (id) => (/^(?:[-\w]+\/)?[\da-f]+(?:\/[\da-f]+)?$/i.test(id) ? `https://gist.github.com/${id}` : null),

  // A numeric pin id, or `<user>/<board>`.
  pinterest: (id) => {
    if (/^\d+$/.test(id)) {
      return `https://www.pinterest.com/pin/${id}/`;
    }

    return /^[-\w]+\/[-\w]+$/.test(id) ? `https://www.pinterest.com/${id}/` : null;
  },

  medium: (id) => (/^[\da-f]+$/i.test(id) ? `https://medium.com/p/${id}` : null),

  // `channel=<c>;clip_id=<id>;t=<t>;video_id=<id>`
  twitch: (payload) => {
    const params = new Map(payload.split(';').map((pair) => pair.split('=', 2) as [string, string]));
    const channel = params.get('channel');
    const clipId = params.get('clip_id');
    const videoId = params.get('video_id');
    const t = params.get('t');

    if (videoId) {
      return `https://www.twitch.tv/videos/${videoId}${t ? `?t=${t}` : ''}`;
    }
    if (clipId) {
      return `https://clips.twitch.tv/${clipId}`;
    }
    if (channel) {
      return `https://www.twitch.tv/${channel}`;
    }

    return null;
  },

  // The payload starts with the forum's own base URL.
  xenforo: (payload) => (/^https:\/\/[^\s"<>]+$/.test(payload) ? payload : null),
};

function resolveS9eIframe(embedSrc: string): string | null {
  const match = embedSrc.match(S9E_IFRAME_PATTERN);
  if (!match) {
    return null;
  }

  return S9E_RESOLVERS[match[1].toLowerCase()]?.(match[2]) ?? null;
}

/**
 * Returns the URL that should be linked to from the click-to-view banner:
 * the canonical page for the given provider if one can be derived from the
 * embed's `src`, or the embed `src` itself as a fallback.
 */
export function resolveSourceUrl(site: string, embedSrc: string): string {
  return CANONICAL_URL_RESOLVERS[site]?.(embedSrc) ?? resolveS9eIframe(embedSrc) ?? embedSrc;
}
