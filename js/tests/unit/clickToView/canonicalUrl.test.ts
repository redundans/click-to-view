import { resolveSourceUrl } from '../../../src/common/clickToView/canonicalUrl';

describe('resolveSourceUrl', () => {
  it('resolves a youtube.com embed URL to the canonical watch page', () => {
    expect(resolveSourceUrl('youtube', 'https://www.youtube.com/embed/abc123')).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('resolves a youtube-nocookie.com embed URL to the canonical watch page', () => {
    expect(resolveSourceUrl('youtube', 'https://www.youtube-nocookie.com/embed/abc123')).toBe('https://www.youtube.com/watch?v=abc123');
  });

  it('resolves a vimeo player embed URL to the canonical vimeo.com page', () => {
    expect(resolveSourceUrl('vimeo', '//player.vimeo.com/video/67207222')).toBe('https://vimeo.com/67207222');
  });

  it('resolves an s9e instagram iframe URL to the instagram.com post', () => {
    expect(resolveSourceUrl('instagram', 'https://s9e.github.io/iframe/2/instagram.min.html#DgFsM0ONbPH')).toBe(
      'https://www.instagram.com/p/DgFsM0ONbPH/'
    );
  });

  it('ignores a theme suffix on the s9e instagram iframe URL', () => {
    expect(resolveSourceUrl('instagram', 'https://s9e.github.io/iframe/2/instagram.min.html#DgFsM0ONbPH#theme=dark')).toBe(
      'https://www.instagram.com/p/DgFsM0ONbPH/'
    );
  });

  it('falls back to the raw embed src for providers without a known resolver', () => {
    const src = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/artist/track';

    expect(resolveSourceUrl('soundcloud', src)).toBe(src);
  });

  it('falls back to the raw embed src if the known resolver cannot parse it', () => {
    const src = 'https://www.youtube.com/unexpected-shape';

    expect(resolveSourceUrl('youtube', src)).toBe(src);
  });
});

describe('resolveSourceUrl for s9e-hosted iframes', () => {
  const s9e = (site: string, hash: string) => `https://s9e.github.io/iframe/2/${site}.min.html#${hash}`;

  it.each([
    ['twitter', s9e('twitter', '526635414338023424#theme=dark'), 'https://x.com/i/status/526635414338023424'],
    ['threads', s9e('threads', 'CuY2OYEAbJw'), 'https://www.threads.com/t/CuY2OYEAbJw'],
    ['tiktok', s9e('tiktok', '6789430799839104261'), 'https://www.tiktok.com/@/video/6789430799839104261'],
    ['telegram', s9e('telegram', 'telegram/83'), 'https://t.me/telegram/83'],
    ['mastodon', s9e('mastodon', 'HackerNewsBot/100181134752056592'), 'https://mastodon.social/@HackerNewsBot/100181134752056592'],
    ['mastodon', s9e('mastodon', 'alice@fosstodon.org/112233'), 'https://fosstodon.org/@alice/112233'],
    [
      'bluesky',
      s9e('bluesky', 'at%3A%2F%2Fdid%3Aplc%3Az72i7hdynmk6r22z27h6tvur%2Fapp.bsky.feed.post%2F3kkrqzuydho2v#embed.bsky.app'),
      'https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/post/3kkrqzuydho2v',
    ],
    ['facebook', s9e('facebook', 'MetaforDevelopers/posts/451016937058647'), 'https://www.facebook.com/MetaforDevelopers/posts/451016937058647'],
    ['facebook', s9e('facebook', 'v224353158889229'), 'https://www.facebook.com/watch/?v=224353158889229'],
    ['facebook', s9e('facebook', 'r873906321076441'), 'https://www.facebook.com/reel/873906321076441'],
    ['facebook', s9e('facebook', 'p10150451016937058'), 'https://www.facebook.com/10150451016937058'],
    [
      'reddit',
      s9e('reddit', 'pics/comments/9wp1qg/my_mom_recently_started_watercolor_painting_and/e9m6pn9#theme='),
      'https://www.reddit.com/r/pics/comments/9wp1qg/my_mom_recently_started_watercolor_painting_and/e9m6pn9/',
    ],
    ['imgur', s9e('imgur', 'AsQ0K3P'), 'https://imgur.com/AsQ0K3P'],
    ['imgur', s9e('imgur', 'a/9UGCL'), 'https://imgur.com/a/9UGCL'],
    ['imgur', s9e('imgur', 'a/gallery/9UGCL'), 'https://imgur.com/gallery/9UGCL'],
    ['gist', s9e('gist', 'JoshyPHP/0ee8433f5a9a779d08ef'), 'https://gist.github.com/JoshyPHP/0ee8433f5a9a779d08ef'],
    ['pinterest', s9e('pinterest', '99360735500167749'), 'https://www.pinterest.com/pin/99360735500167749/'],
    ['pinterest', s9e('pinterest', 'pinterest/official-news'), 'https://www.pinterest.com/pinterest/official-news/'],
    ['medium', s9e('medium', 'e7e2cf9b8a95'), 'https://medium.com/p/e7e2cf9b8a95'],
    ['twitch', s9e('twitch', 'channel=twitch;clip_id=;t=17m17s;video_id=29415830'), 'https://www.twitch.tv/videos/29415830?t=17m17s'],
    ['twitch', s9e('twitch', 'channel=chess;clip_id=CrepuscularOptimisticEagle;t=;video_id='), 'https://clips.twitch.tv/CrepuscularOptimisticEagle'],
    ['twitch', s9e('twitch', 'channel=twitch;clip_id=;t=;video_id='), 'https://www.twitch.tv/twitch'],
    ['xenforo', s9e('xenforo', 'https://xenforo.com/community/threads/217381'), 'https://xenforo.com/community/threads/217381'],
  ])('resolves %s (%s)', (site, src, expected) => {
    expect(resolveSourceUrl(site, src)).toBe(expected);
  });

  it('falls back to the raw embed src for s9e providers without a resolver', () => {
    const src = s9e('sporcle', 'abc123');

    expect(resolveSourceUrl('sporcle', src)).toBe(src);
  });

  it('falls back to the raw embed src if the s9e payload is malformed', () => {
    const src = s9e('bluesky', '%E0%A4%A#embed.bsky.app');

    expect(resolveSourceUrl('bluesky', src)).toBe(src);
  });
});
