# Repository structure

This is a monorepo consisting of multiple library-packages for angular:

- [practices-ui-clarity](/practices-ui-clarity/README.md): Extensions for Clarity component library
- [practices-ui-ktbe](/practices-ui-ktbe/README.md): Component library following the [Kanton Bern Styleguide](https://kantonbern.snowflake.ch/styleguides/1/Kanton-Bern/), using tailwind and Angular CDK
- [practices-ui](/practices-ui/README.md): Agnostic services and helpers for Angular (**Legacy**)
- [practices-ng-commands](/practices-ng-commands/README.md): Command utilities for Angular
- [practices-ng-common-util](/practices-ng-common-util/README.md): Common utilities for Angular applications
- [practices-ng-dirty-guard](/practices-ng-dirty-guard/README.md): Dirty guard for Angular forms
- [practices-ng-forms](/practices-ng-forms/README.md): Enhanced forms for Angular
- [practices-ng-list-view-source](/practices-ng-list-view-source/README.md): List view source utilities
- [practices-ng-logging](/practices-ng-logging/README.md): Logging utilities for Angular
- [practices-ng-signals](/practices-ng-signals/README.md): Signal management for Angular
- [practices-ng-status](/practices-ng-status/README.md): Status management for Angular
- [practices-ng-status-types](/practices-ng-status-types/README.md): Status type definitions for Angular

# Typescript

- Run `Format Document` vscode command after generating code (or terminal `pnpm run format`).
- Always check if the code actually typechecks and compiles (See problems tab, or run typescript typechecker), if any doubt, run `npx nx build PROJECTNAME`, for example `npx nx build practices-ng-forms`.
- to run the ktbe samples app, run: `pnpm run start-ktbe`
- When moving code to new files, make sure to update the index.ts file in the root of the corresponding package.
- Do not create new index files in sub-directories, try to find the root index file.
- For occurence of repeating code, or verbose or complicated code, create utility functions in separate files.
- For utility functions, always add tests in a corresponding spec.ts file.
- Do not test angular components/services directly, rather identify logic that needs testing, split those up into functions, and test those isolated.
- Always postfix a variable that is of a `Signal` type (eg. `signal()`, `computed()`, `input()`, `viewChild()`, etc all from `@angular/core`) with `Signal`, for example: `const myValueSignal = signal(10);`.
- Angular Components: Use `inject()` from (`@angular/core`) instead of constructor injection
- Angular Components: Use `public readonly myValueSignal = input<T | null>(null, {alias: 'myValue'})` or `input.required<T>({alias: ...})` from (`@angular/core`) instead of `@Input` annotations.
- Many methods in angular apps return observables, apis, or HttpClient, so to await in an async method, wrap it with `firstValueFrom`.
- When adding new features such as components or making changes to api, make sure to update the readme of the library package.
- Classes, order of members and visibility:
    1. private injects
    2. private variables
    3. public inputs
    4. if needed: Constructor, NgOnInit, Interface-Implementations...
    5. protected FormGroup + Validationen
    6. protected state Signals + related Effects
    7. protected commands (command.\*)
    8. protected queries (command.query.\*)
    9. protected getters
    10. protected methods
    11. private methods
    - If two members are closely related, they may be grouped together, even if different visibility.
    - To group closely related members, use only a single new line instead of two, example:

        ```ts
        class MyComponent {
            private readonly _someDependency = inject(SomeDependency);

            public readonly myInputSignal = input.required<Xyz>({alias: 'myInput'});

            // The following members are closely related, and `someComputationSignal` is not used elsewhere
            protected readonly someComputationSignal = computed(() => _someDependency.transformSomething(this.myInput));
            protected readonly someQuery = command.query.withSignalTrigger(this.someComputationSignal, (someComputation) => doSomething...);
        }
        ```

- When a effect closely depends on a signal / computed / other, use `withEffects` from `@nexplore/practices-ng-signals`:
    ```ts
    protected readonly myValueSignal = withEffects(
        signal(...),
        effect(() => {
            const myValue = this.myValueSignal();
            // Do something with myValue...
        })
    );
    ```
- Class members, naming:
    - `private _underScorePrefixLowerCamelCase`
    - `protected/public lowerCamelCase`
- Always add visibility to class members:
    - Use private when only used within class
    - Use protected when component template needs to access member
    - Use public only when necessary, when exposing an interface, or declaring component inputs/outputs
- Always mark class members as `readonly` unless they absolutely need to be mutable (which normally shouldn't be the case, as instead Signals should be used).
- When authoring angular components, also add a storybook file, as long as the component has not too many dependencies, especially if they are hard to resolve or mock.
  Here is an example storybook:

    ```ts
    // File: toast.stories.ts
    import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

    import { PuibeToastComponent } from './toast.component';

    type Args = {
        text: string;
        actions: any[];
        closeable: boolean;
        variant?: 'default' | 'success' | 'error' | 'info';
        showAlertIcon: boolean;
    };

    const meta: Meta<Args> = {
        title: 'PUIBE/toast',
        component: PuibeToastComponent,
        tags: ['autodocs'],
        argTypes: {},
        decorators: [
            moduleMetadata({
                imports: [PuibeToastComponent],
            }),
        ],
        render: (args) => ({
            props: {
                ...args,
            },
            template: `
            <puibe-toast [closeable]="closeable" [variant]="variant" [showAlertIcon]="showAlertIcon">
                ${args.text}
                <button puibeToastAction *ngFor="let action of actions;">
                    {{ action.text }}
                </button>
            </puibe-toast>`,
        }),
    };

    export default meta;

    type Story = StoryObj<Args>;

    export const ToastDefaultCloseable: Story = {
        args: {
            variant: 'default',
            text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
            actions: [{ text: 'Zurück zur Startseite' }],
            closeable: true,
        },
    };
    export const ToastErrorCloseable: Story = {
        args: {
            variant: 'error',
            text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
            actions: [{ text: 'Zurück zur Startseite' }, { text: 'weitere Aktionen' }],
            closeable: true,
        },
    };
    export const ToastInfoCloseable: Story = {
        args: {
            variant: 'info',
            text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
            actions: [{ text: 'Zurück zur Startseite' }, { text: 'weitere Aktionen' }],
            closeable: true,
        },
    };

    // ... Try to add at least an example for every Input and its options
    ```

- When you fully completed a feature for the KTBE library, automatically run `pnpm run storybook-ktbe` to demonstrate the storybook for the new components.
- When running terminal commands, understand that we are probably in a windows environment, for example, the `&&` command might not work.

# Angular templates

- Always use control flow syntax instead of structural directives, if possible.
- Do not forget to add the `track` to for loops, eg: `@for (item in items; track item.id)`.
- If you don't know what to track, just use either the item reference itself, or `$index`, depending on use case.
- Try to split up templates into multiple smaller presentation components, to reuse markup and styles.

# Tailwind styling in Practices KTBE

- In the KTBE packages (practices-ui-ktbe, samples-ktbe), use tailwind classes for styling
- Here is a list of available colors in KTBE:
    - transparent
    - red (KTBE main color)
    - black
    - light-sand
    - sand
    - dark-sand
    - sand-hover
    - cappuchino
    - anthrazit (Used for primary buttons)
    - anthrazit-solid
    - anthrazit-hover
    - dark-gray
    - dark-gray-68
    - dark-gray-50
    - dark-gray-50-solid
    - gray
    - light-gray
    - very-light-gray
    - white
    - red-hover
    - green
    - success-green
- When authoring components with styles, use the following syntax, to make sure the component remains isolated but styles can be easily overridden in tailwind:
    ```ts
    @Component({
        selector: 'puibe-my-component'
        styles: `
                    puibe-my-component {
                        @apply flex flex-col gap-2;
                    }
                `,
        encapsulation: ViewEncapsulation.None,
    })
    ...
    ```
- When a style needs to be updated dynamically on the component root element, use data-attributes:

    ```ts
    @Component({
        selector: 'puibe-my-component'
        styles: `
                    puibe-my-component {
                        @apply flex flex-col gap-2;
                    }

                    puibe-my-component[data-active="true"] {
                        @apply bg-sand;
                    }
                `,
        encapsulation: ViewEncapsulation.None,
    })
    export class PuibeMyComponent {
        public activeSignal = input(false, {alias: 'active'});

        constructor(elementRef: ElementRef<HTMLElement>, renderer: Renderer2) {
            effect(() => {
                const active = this.activeSignal();
                renderer.setAttribute(elementRef.nativeElement, 'data-active', active);
            });
        }
    }
    ```

# Readmes

When generating documentation, create a draft first, but then make sure to go through all related code files one by one.
For example, when editing a readme for a library, first look at the index.ts file, then generate a rough draft. Then go through EACH exported symbol of that index and check the actual implementation to get an accurate documentation.

When referencing for symbols, make sure to create a markdown link directly to the file, relative to the current directory, for example: [PuibeStatusHubComponent](../practices-ui-ktbe/src/lib/status-hub/status-hub.component.ts)

If a local library package is referenced, add a link to the package readme, for example: [@nexplore/practices-ui-ktbe](../practices-ui-ktbe/README.md)

IMPORTANT: DOUBLE CHECK IF THE LINKS ARE CORRECT AND LEAD TO AN ACTUAL FILE.

Also try to look at other readmes that are adjacent in the folder structure, to take an inspiration from their structure.

