const { CompilerFacadeImpl } = require('@angular/compiler');

globalThis.ng ??= {};
globalThis.ng.ɵcompilerFacade = new CompilerFacadeImpl();
