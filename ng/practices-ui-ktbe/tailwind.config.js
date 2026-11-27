// Kept for applications that load the preset by file path, e.g.
// `require('./node_modules/@nexplore/practices-ui-ktbe/tailwind.config.js')` (Tailwind loads it with jiti).
// Prefer `require('@nexplore/practices-ui-ktbe/tailwind.config.js')`, which resolves to tailwind.config.cjs.
module.exports = require('./tailwind.config.cjs');
