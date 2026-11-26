// `ora` (spinner used by the Angular devkit package-manager task executor) is ESM-only and Jest runs the specs as
// CommonJS. The schematics specs never install packages, so a no-op spinner is sufficient.
const spinner = {
    start: () => spinner,
    stop: () => spinner,
    succeed: () => spinner,
    fail: () => spinner,
    text: '',
};

module.exports = { __esModule: true, default: () => spinner };
