import { describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import {
    REWRITE_RESOURCE_CONFIG,
    RewriteMissingTranslationHandler,
    RewriteResourceConfig,
} from './missing-translation.handler';

const mockTranslation = {
    Base: {
        Sample_Fallback: 'Fallback',
    },
    Other: {
        Sample_Foo: 'Foo (From "Other.Sample_Foo")',
        Interpolate_Sample: 'Interpolate from: {{ name }}',
    },
    Fallback: {
        Sample_Foo: 'Foo (From "Fallback.Sample_Foo")',
        Sample_Bar: 'Bar (From "Fallback.Sample_Bar")',
    },
    SomethingElse: {
        Sample_Foo: 'Foo (From "SomethingElse.Sample_Foo")',
    },
};

class FakeLoader implements TranslateLoader {
    getTranslation(_lang: string) {
        return of(mockTranslation);
    }
}

describe('MissingTranslationHandler', () => {
    let translate: TranslateService;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configureTestBed = (rewriteConfig: RewriteResourceConfig) => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeLoader },
                    missingTranslationHandler: {
                        provide: MissingTranslationHandler,
                        useClass: RewriteMissingTranslationHandler,
                    },
                }),
            ],
            providers: [
                {
                    provide: REWRITE_RESOURCE_CONFIG,
                    useValue: rewriteConfig,
                },
            ],
        }).compileComponents();

        translate = TestBed.inject(TranslateService);
        translate.setDefaultLang('en');
    };

    it('should resolve a translation that does not require rewriting', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
        });
        const result = translate.instant('SomethingElse.Sample_Foo');
        expect(result).toEqual(mockTranslation.SomethingElse.Sample_Foo);
    });

    it('should rewrite and resolve resource types, if a rewrite-to type has been specified', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
        });
        const result = translate.instant('Base.Sample_Foo');
        expect(result).toEqual(mockTranslation.Other.Sample_Foo);
    });

    it('should interpolate for rewritten ressources ', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
        });
        const result = translate.instant('Other.Interpolate_Sample', { name: 'Other' });
        expect(result).toEqual('Interpolate from: Other');
    });

    it("should rewrite and resolve resource types, if the rewrite-to type isn't, but a fallback type is specified", async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
        });
        const result = translate.instant('Base.Sample_Bar');
        expect(result).toEqual(mockTranslation.Fallback.Sample_Bar);
    });

    it('should not rewrite and resolve resource types, if neither a rewrite-to, nor a fallback type is specified', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
        });
        const result = translate.instant('Base.Sample_Title');
        expect(result).toEqual('Base.Sample_Title');
    });

    it('should perform correct formatting if function is provided', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Fallback',
                },
            },
            missingKeyTransformFn: (key: string) => `[${key}]`,
        });
        const result = translate.instant('Base.Sample_Title');
        expect(result).toEqual('[Base.Sample_Title]');
    });

    it('should not fail if only a rewrite-to type is specified, but the resource type does not exist', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                },
            },
        });
        const result = translate.instant('Base.Sample_Title');
        expect(result).toEqual('Base.Sample_Title');
    });

    it('should be able to use the rewrite-from key as a fallback key', async () => {
        await configureTestBed({
            rewriteTypeConfig: {
                Base: {
                    rewriteTo: 'Other',
                    fallbackTo: 'Base',
                },
            },
        });

        const result = translate.instant('Base.Sample_Fallback');
        expect(result).toEqual(mockTranslation.Base.Sample_Fallback);
    });
});
