type CompilerFacade = {
    compileServiceDeclaration?: unknown;
};

describe('Angular 22 compiler facade setup', () => {
    it('keeps a preset facade from replacing the Angular 22 facade', () => {
        const angularGlobal = globalThis as typeof globalThis & {
            ng?: {
                ɵcompilerFacade?: CompilerFacade;
            };
        };
        const facade = angularGlobal.ng?.ɵcompilerFacade;

        expect(typeof facade?.compileServiceDeclaration).toBe('function');

        angularGlobal.ng!.ɵcompilerFacade = {};

        expect(angularGlobal.ng?.ɵcompilerFacade).toBe(facade);

        angularGlobal.ng!.ɵcompilerFacade = {
            compileServiceDeclaration: () => undefined,
        };

        expect(angularGlobal.ng?.ɵcompilerFacade).toBe(facade);
    });
});
