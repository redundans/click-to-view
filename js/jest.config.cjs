module.exports = require('@flarum/jest-config')({
  // The default setup boots a full Flarum app and needs a working
  // `@flarum/core` dependency (there's no published npm package for it, so
  // this only works inside a full Flarum install with core symlinked in).
  // Our unit tests only cover plain utility modules that don't touch the
  // `app` global, so we skip that bootstrap here. Remove this override if
  // integration tests that rely on `app` are added later.
  setupFilesAfterEnv: [],
});
