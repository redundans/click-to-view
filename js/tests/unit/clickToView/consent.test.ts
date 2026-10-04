import { grantConsent, hasConsent } from '../../../src/common/clickToView/consent';

describe('clickToView consent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no consent by default', () => {
    expect(hasConsent('youtube')).toBe(false);
  });

  it('remembers consent per provider', () => {
    grantConsent('youtube');

    expect(hasConsent('youtube')).toBe(true);
    expect(hasConsent('vimeo')).toBe(false);
  });

  it('persists consent across reads', () => {
    grantConsent('youtube');
    grantConsent('twitter');

    expect(hasConsent('youtube')).toBe(true);
    expect(hasConsent('twitter')).toBe(true);
  });

  it('does not throw if localStorage contains invalid JSON', () => {
    localStorage.setItem('redundans-click-to-view-consent', '{not json');

    expect(() => hasConsent('youtube')).not.toThrow();
    expect(hasConsent('youtube')).toBe(false);
  });
});
