import { APP_INITIALIZER, Provider } from '@angular/core';
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
