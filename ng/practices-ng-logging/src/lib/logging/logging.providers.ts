import type { Provider } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { configureDebugLogging } from './logging.util';

export function provideConsoleLogging(): Provider {
    return {
        provide: APP_INITIALIZER,
        useFactory: () => () => {
            configureDebugLogging();
        },
        multi: true,
    };
}
