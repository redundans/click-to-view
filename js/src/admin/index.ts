import app from 'flarum/admin/app';

export { default as extend } from './extend';

app.initializers.add('redundans-click-to-view', () => {
  console.log('[redundans/click-to-view] Hello, admin!');
});
