import { applicationConfig, componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { CommonModule } from '@angular/common';
import { Injectable, importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePractices } from '@nexplore/practices-ui';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateModule } from '@ngx-translate/core';
import type { Decorator, Parameters } from '@storybook/angular';
import { DateService } from '../src/lib/date.service';
import { StorybookWrapperComponent } from '../src/stories/storybook-wrapper.component';

// The line below would auto-generate controls for the stories.
// Unfortunately it generates not only controls for @Inputs(), but for any public property, which makes no sense.
// setCompodocJson(docJson);

export const parameters: Parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            // TODO: Validate if this does anything
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

@Injectable({ providedIn: 'root' })
export class PuibeSBMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams): string {
        return (params?.interpolateParams as any)?.fallback || '[' + params.key + ']';
    }
}

export const decorators: Decorator[] = [
    moduleMetadata({
        imports: [StorybookWrapperComponent, BrowserAnimationsModule, CommonModule, FormsModule, ReactiveFormsModule],
    }),
    applicationConfig({
        providers: [
            importProvidersFrom(
                TranslateModule.forRoot({
                    missingTranslationHandler: {
                        provide: MissingTranslationHandler,
                        useClass: PuibeSBMissingTranslationHandler,
                    },
                })
            ),
            DateService,
            providePractices(),
        ],
    }),
    componentWrapperDecorator((story) => `<puibe-storybook-wrapper>${story}</puibe-storybook-wrapper>`),
];
