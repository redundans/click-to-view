import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Post from 'flarum/common/models/Post';
import CommentPost from 'flarum/forum/components/CommentPost';

import { transformEmbedsHtml } from '../common/clickToView/transform';
import { applyStoredConsent, bindClickToViewDelegation } from './clickToView/dom';

export { default as extend } from './extend';

app.initializers.add('redundans-click-to-view', () => {
  // Rewrite every post's rendered HTML so that s9e/TextFormatter media embeds
  // are replaced with an inert click-to-view banner before it ever reaches
  // the live DOM.
  override(Post.prototype, 'contentHtml', function (original: () => string | null | undefined) {
    const html = original();

    if (typeof html !== 'string') {
      return html;
    }

    return transformEmbedsHtml(html, (site) => ({
      message: app.translator.trans('redundans-click-to-view.forum.click_to_view.message', { site }, true),
      buttonLabel: app.translator.trans('redundans-click-to-view.forum.click_to_view.button', { site }, true),
      sourceLinkLabel: app.translator.trans('redundans-click-to-view.forum.click_to_view.source_link', { site }, true),
    }));
  });

  extend(CommentPost.prototype, ['oncreate', 'onupdate'], function () {
    applyStoredConsent(this.element);
  });

  bindClickToViewDelegation();
});
