// jsdom has no ResizeObserver, which PuibeLabelDirective uses
globalThis.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
};
