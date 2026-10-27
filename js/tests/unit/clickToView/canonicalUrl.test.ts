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

  it('falls back to the raw embed src for providers without a known resolver', () => {
    const src = 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/artist/track';

    expect(resolveSourceUrl('soundcloud', src)).toBe(src);
  });

  it('falls back to the raw embed src if the known resolver cannot parse it', () => {
    const src = 'https://www.youtube.com/unexpected-shape';

    expect(resolveSourceUrl('youtube', src)).toBe(src);
  });
});
