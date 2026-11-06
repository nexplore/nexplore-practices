# Translations

Practices.Ui utilizes the [ngx-translate](https://github.com/ngx-translate/core) to provide translations for the frontend.
Resources which need to be translated are identified via a key in the form of `obj.prop.something`. Such keys are found
throughout the components provided by Practices.Ui.

If you intend to use these components, you need to provide translations for these keys.

Practices.UI utilizes these prefixes for the keys:
| Prefix | Description |
| --- | --- |
| `Practices.` | General keys which are used by Practices.Ui components |
| `Messages.` | Keys which are used by Practices.Ui components to display messages |

## Configuration

If you want to rewrite the prefixes, you can do so by passing `rewriteResourceConfig` to `providePractices()`.
Its `rewriteTypeConfig` maps each prefix you want to rewrite to an object with a `rewriteTo` property and an optional
`fallbackTo` property:

```ts
...
bootstrapApplication(AppComponent, {
    providers: [
        providePractices({
            rewriteResourceConfig: {
                rewriteTypeConfig: {
                    Practices: {
                        rewriteTo: 'MyApp',
                        fallbackTo: 'MyGeneral',
                    },
                    Messages: {
                        rewriteTo: 'MyMessages',
                    },
                },
            },
        }),
    ],
});
```

This configures `RewriteMissingTranslationHandler` as ngx-translate's `MissingTranslationHandler`. When ngx-translate
cannot resolve a key, the handler checks its prefix against `rewriteTypeConfig` and tries the corresponding rewritten key.

Some examples for the configuration above:

- `Practices.Labels_Title` -> `MyApp.Labels_Title` -> `MyGeneral.Labels_Title`
- `Messages.Labels_Title` -> `MyMessages.Labels_Title`

If the handler cannot resolve the key configured by `rewriteTo`, it tries the key configured by `fallbackTo`, when
present. If neither key resolves (or the original key has no configured prefix), it returns the original missing key.
You can optionally set `missingKeyTransformFn` alongside `rewriteTypeConfig` to transform that returned key:

```ts
providePractices({
    rewriteResourceConfig: {
        rewriteTypeConfig: {
            Practices: {
                rewriteTo: 'MyApp',
                fallbackTo: 'MyGeneral',
            },
        },
        missingKeyTransformFn: (key) => `[${key}]`,
    },
});
```

With this function, an unresolved `Practices.Labels_Title` is returned as `[Practices.Labels_Title]`.

## TitleService

Practices.Ui provides a `TitleService` which can manage your applications page title (HTML `<title>` tag), based on the `primary` route.
It leverages angulars [`TitleStrategy`](https://angular.io/api/router/TitleStrategy) to achieve this. It allows you to set custom titles in your component using the provided `setTitle` method.

This service also provides a `breadcrumbTitle$` observable, which is intended to be used in your apps breadcrumbs component. You should use this observable to get the content for the breadcrumbs title (leaf node). Like the page title, you can set a custom breadcrumb title using the `setBreadcrumbTitle` method.

### Example of usage:

Provide and configure the service:

```ts
import { TitleService } from '@nexplore/practices-ui';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, TitleStrategy } from '@angular/router';

bootstrapApplication(AppComponent, {
    providers: [provideRouter(...) {
        providePractices({
            titleServiceConfig: {
                titleTransformer: (title) => title + ' | SamplesKtBE', // <-- Declare a title transformer, which gets applied to all **page** titles
                autoSetBreadcrumbTitle: true, // <-- Automatically set the breadcrumb title, if the page title is set
                localize: true,  // <-- Localize the page title
            }
        }),
    }],
});
```

`providePractices()` will inject the `TitleService`, overriding the default `TitleStrategy`

Use in component:

```ts
import { Router } from '@angular/router';
import { TitleService } from '@nexplore/practices-ui';

@Component({
    selector: ...
})
export class SampleComponent implements OnInit {
    constructor(private titleService: TitleService, private router: Router) {}

    ngOnInit(): void {
        this.titleService.setTitle('My Custom Title', { localize: false, autoSetBreadcrumbTitle: false }); // <-- Set a custom title, which is not localized and does not set the breadcrumb title
        this.titleService.setBreadcrumbTitle('My Custom Breadcrumbs Title', { localize: false, breadcrumbUrl: this.router.url }); // <-- Set a custom breadcrumb title without localization for a specific route
    }
}
```
