# Migration Guides

This file serves as an additional guide to the [changelog](../../CHANGELOG.md), explaining concepts and migration notes.

Note: The goal would be, with time, to synthesize these guides in their own documentation-files.

## Migrating to use Signals

### Inputs and outputs

Inputs and outputs should be described using the new signal-based factory functions by default:

```ts
// Before:
@Input()
myValue?: string;

@Input({required: true})
myRequiredValue: number;

@Output()
myValueChange = new EventEmitter<string>()

@ViewChild('triggerButton', { static: true })
triggerButton: ElementRef;

// Now (signal-based approach):
readonly myValueSignal = input<string | null>(null, {alias: 'myValue'});
readonly myRequiredValueSignal = input.required<number>({alias: 'myValue'});
readonly myValueChange = output<string>() // If an observable is preferred, it's acceptable to still use `@Output()`.
protected readonly triggerButtonSignal = viewChild('triggerButton', {read: ElementRef});
```

### Constructor injection

It is now preferred to use `inject()` over constructor injection:

```ts
// Before
constructor(private readonly _api: MyApiProxy) {

}

// Now
private readonly _api = inject(MyApiProxy);
```

### Effects

Effects are the glue between signals and any other non-standard behaviors.
The Practices Library offers some helper functions to work with effects.

#### `withEffects`

Often, it's hard to keep signals and related effects together, and it's not nice to put all effects in the constructor, especially in bigger components.
That's where the `withEffects` utility comes into play:

```ts
class MyComponent {
    // Before
    protected readonly xyzSignal = signal(...)
    public constructor() {
        effect(() => {
            const xyz = this.xyzSignal();
            ...
        });
    }

    // Now
    protected readonly xyzSignal = withEffects(
        signal(...),
        effect(() => {
            const xyz = this.xyzSignal();
            ...
        })
    );
}
```

Note, it's not always possible to use `withEffects`, for example `input()` does not allow using it because of the way the Angular compiler works.

#### `subscriptionEffect`

Imagine a component that has an input, and every time the input changes, an Rx Observable needs to be subscribed to.

```ts
function createSomeLongLastingObservable$(value: string): Observable<...>
{
    return interval(1000)...
}

class MyComponent {
    // Before
    private _mySubscription = new Subscription();

    public readonly myInput = input<string>('');

    public constructor() {
        effect(() => {
            const myValue = this.myInput();
            this._mySubscription?.unsubscribe();
            this._mySubscription = createSomeLongLastingObservable$(myValue).subscribe(...);
        })
    }

    // Now
    public readonly myInput = input<string>('');

    public constructor() {
        subscriptionEffect(() => {
            const myValue = this.myInput();
            return createSomeLongLastingObservable$(myValue).subscribe(...);
        })
    }
}
```

## Reactive Forms

The practices library offers a new form group builder that makes working with signals much easier.

```typescript
class MyComponent {
    // Before
    constructor(private formBuilder: FormBuilder) {}
    myForm = this.formBuilder.formGroup({
        name: this.formBuilder.formControl<string | null>(null),
        ...
    });

    // Now
    protected readonly myForm = formGroup.withBuilder(({control}) => ({
            name: control<string | null>(null),
            email: control<string | null>(null),
            isEmailRequired: control<boolean>(false), email: control<string | null>(null),
            isEmailRequired: control<boolean>(false),
        })
        .withValidation(({dependent, conditional}) => ({
                name:  conditional(() => this.isNameRequiredSignal() && Validators.required), // Name is required whenever the given signal is true
                email: dependent(({isEmailRequired}) => isEmailRequired && [Validators.required]), // Validator is reapplied whenever `isEmailRequired` changes
                isEmailRequired: []
        }))
        .withEffect((myForm) => {
            const valid = myForm.validSignal();
            if (!valid) {
                console.log('form got invalid!');
            }
        });

    public readonly isNameRequiredSignal = input(false);
}
```

For more information, see [practices-ng-forms](../../ng/practices-ng-forms/README.md).

## ListViewSource

The ListViewSource class is still available, but a new fluent builder API has been introduced for `tableViewSource` and `selectViewSource`, which offers additional functionality, such as directly connecting a filter form group to the view source.

Example:

```typescript
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';
...

@Component({
    ...,
    imports: [
        PracticesKtbeTableComponentsModule,
        PracticesKtbeFormComponentsModule,
        ...
    ],
    templateUrl: './sample-list-component.html',
})
export class SampleListComponent {
    private _sampleApi = inject(SampleApiProxy);

    protected readonly filterForm = formGroup.withBuilder(({control}) => ({
        keywords: control<string | null>(null),
    }));

    protected readonly sampleViewSource = tableViewSource
        .withFilterForm({
            type: SampleListEntryDto,
            filterForm: this.filterForm,
            loadFn: (params) =>
                this._sampleApi.getAll(
                    params.filter.keywords,
                    params.skip,
                    params.take,
                    params.orderings,
                    params.includeTotal,
                ),
            columns: {
                name: {
                    columnLabelKey: 'Labels.Sample_Name',
                    sortable: true,
                },
                createdBy: {
                    columnLabelKey: 'Labels.CreatedBy',
                    sortable: true,
                },
                ...
            },
            orderBy: 'name',
        })
        .withPersistedParams(persistParamsInCurrentNavigation());
}
```

For more information, see [practices-ng-list-view-source](../../ng/practices-ng-list-view-source/README.md).

## DestroyRef

Previously, the practices library offered the `DestroyService` class, which is now obsolete and replaced by Angular's built-in `DestroyRef`

```ts
// Before
@Component({
   ...
   providers: [DestroyService],
})
export class MyComponent {
   constructor(private readonly _destroy$: DestroyService) {
       someObservable.pipe(
           takeUntil(this._destroy$)
       ).subscribe(....)
   }
}

// Now
export class MyComponent {
   // Provider is no longer necessary
   constructor() {
       someObservable.pipe(takeUntilDestroyed()).subscribe(...);

       // Alternatively, practices provide this helper:
       subscriptionEffect(() => someObservable.subscribe(...))
   }
}
```

## Proposal Component styles

So far, we have mostly regulated component-specific styles using CSS classes directly on the component element:

```ts
@Component(
  selector: 'puibe-my-component',
  ...
)
export class PuibeMyComponent {
  @HostBinding('class')
  readonly className = 'm-6';
}
```

This works quite well, with a few drawbacks:

- These classes cannot be overridden from the outside if, for example, a different margin needs to be set, then the selector with the highest specificity will win, making the behavior quite unpredictable.
- The markup appears polluted, and it's not clear whether a class was set by the app or the library.

Recently, I found an approach that eliminates these drawbacks.

It's easiest to explain with an example:

```ts
@Component(
  selector: 'puibe-my-component',
  ...
  styles: [
      `
          puibe-my-component {
              @apply m-6;
          }
      `,
  ],
  encapsulation: ViewEncapsulation.None,
)
export class PuibeMyComponent {

}
```

Using the `@apply` directive allows applying Tailwind classes without using the `class` attribute.
Using `ViewEncapsulation.None` prevents the selector from becoming too specific and thus cannot be overridden.

However, there was still a problem with directives that always had higher specificity than Tailwind classes due to their attribute selectors.

To the rescue comes a relatively new CSS feature, the `:where()` pseudo-class.
This allows creating selectors with `0` specificity.
Since directives cannot have styles, these must be defined in a global stylesheet or in the stylesheet of a parent component.
In the following (relatively meaningless) example, you can see how this can be applied with Tailwind:

```ts
@Component(
  selector: 'my-list',
  ...
  styles: [
      `
          my-list:where([myListAddMargins]) {
              @apply m-6;
          }
      `,
  ],
  encapsulation: ViewEncapsulation.None,
)
export class ListComponent {

}

@Directive(
  selector: '[myListAddMargins]',
)
export class ListAddMarginsDirective {

}
```

Now the selector is on the tag name itself and can be overridden with Tailwind CSS classes as a consumer of the library without "unknown third parties".

The browser support for `:where()` is quite good: https://caniuse.com/?search=%3Awhere

## Commands

A command contains an action that can be asynchronous or synchronous, as well as the status of this action, e.g., whether it is running or an error has occurred.

```ts
sampleCommand = command.action((args: SampleArgs) => {
  return this.apiProxy.doSomethingAsync(args.id);
});
```

This command can be triggered via a directive in the UI, for example on click:

```html
<button puibeButton [clickCommand]="sampleCommand" [commandArgs]="{id: 123}">
  ...
</button>
```

### Migration from old Command Syntax

Commands were typically defined as a `Command` class:

```ts
// Before (deprecated)
myCommand = Command.create((args: SampleArgs) => {
    return this.apiProxy.doSomethingAsync(args.id);
}, {
  statusCategory: 'action'
  successMessage: 'Successfully did something',
  blocking: true
});

// New
myCommand = command.action((args: SampleArgs) => {
  return this.apiProxy.doSomethingAsync(args.id);
}, {
  status: {
    statusCategory: 'action',
    successMessage: 'Successfully did something',
    blocking: true
  }
});
```

## Status Hub

The new Status Hub reads all status updates from the StatusService and presents them to the user.
The component must be instantiated once globally in the application:

```html
<puibe-status-hub>
  <ng-container *puibeIfErrorStatus="let status">
    Something went wrong!
    <puibe-expansion-panel
      *ngIf="status.error?.stack ?? status.error?.message"
      caption="Details"
      class="flex-grow-0 text-black"
      [enableContentScroll]="true"
    >
      <code *ngIf="status.error.stack" class="whitespace-pre">
        {{ status?.error.stack ?? status.error?.message }}</code
      >
    </puibe-expansion-panel>
  </ng-container>
</puibe-status-hub>
```

## Status Service Extensions

There are some extensions to the `StatusService` that allow for more precise definition of what the intention of a status operation is (and how it should be displayed by the StatusHub):

```ts

/**
 * Generic category to specify the intend of an operation.
 *
 * Used to guide the visual representation of a the status progress.
 */
export type StatusCategory = 'none' | 'action' | 'query' | 'query-list' | 'action-save' | 'action-delete';

export interface StatusProgressOptions {
    /** If `true`, the running operation should block the user from interacting */
    blocking?: boolean;

    /** Allows to inform the user with a custom message regarding the progress */
    progressMessage?: string | Observable<string>;

    /** Set a success message for when the status reports success */
    successMessage?: SuccessMessage;

    /** Set a custom error message for when the status reports an error */
    errorMessage?: ErrorMessage;

    /** If `true`, the progress will not be shown (eg. no busy spinner), unless an error occurs. */
    silent?: boolean;

    /**
     * Generic category to specify the intend of an operation.
     *
     * Used to guide the visual representation of a the status progress.
     */
    statusCategory?: StatusCategory;
}

....
registerAction(sourceObservable, {statusCategory: 'action-save'});
```

These commands also support the same options:

```html
<button
  puibeButton
  [clickCommand]="saveCommand"
  [commandOptions]="{ status: { statusCategory: 'action-save'} }"
>
  ...
</button>
```

Or directly when creating the command:

```ts
command.action(() => ..., { status: {statusCategory: 'action-save'} })
```

The result would be a toast message with the text `Saving...`, and after successful execution of the action, a success toast message would appear.

## Dirty Guard

The `PuiGlobalDirtyGuardDirective` prevents leaving an unsaved form and confronts the user with a confirm dialog.

The directive must be defined globally in the router outlet:

```html
<main class="mt-10 focus:outline-none" tabindex="-1">
  <h1 class="sr-only">{{ title$ | async }}</h1>
  <router-outlet puiGlobalDirtyGuard></router-outlet>
</main>
```

To mark a route with the dirty state, there are two approaches:

### Approach 1: `CanDeactivate` / `IHasDirtyFormState` (Legacy)

The component must implement either the `CanDeactivate` or the `IHasDirtyFormState` interface:

```ts
export class SamplePageComponent implements IHasDirtyFormState {
  // This formState is used by the PuibeGlobalDirtyGuardDirective
  readonly formState$ = new BehaviorSubject<IPuibeFormState>();
}
```

```html
<!-- sample-page.component.html -->
<form
  [formGroup]="sampleForm"
  puibeForm
  (formStateChange)="formState$.next($event)"
>
  ...
</form>
```

### Approach 2: `puiForm` with `enableDirtyFormNavigationGuard` (Recommended)

The simpler variant is the `puiForm` directive with `enableDirtyFormNavigationGuard`:

```html
<!-- sample-page.component.html -->
<form [formGroup]="sampleForm" puiForm [enableDirtyFormNavigationGuard]="true">
  ...
</form>
```

This automatically tracks the dirty state of the `FormGroup` and enables/disables the dirty guard accordingly.

## Integration Commands, StatusService, DirtyGuard

Here's an example with a button that has a command based on a form group that saves data and checks validation and dirty state.

**Note**: This example uses components from the Kanton-Bern `practices-ui-ktbe` component library.
If a different component library is used, the components must be adapted accordingly, or own implementations of the underlying features must be used.

```html
<button
  puibeButton
  [clickCommand]="trySaveCommandSignal()"
  [commandOptions]="{ status: {statusCategory: 'action-save'} }"
  variant="primary"
>
  Save
</button>
<button
  puibeButton
  [clickCommand]="trySaveCommandSignal()"
  [commandArgs]="{ navigateBackToList: true }"
  [commandOptions]="{ status: {statusCategory: 'action-save'} }"
>
  Save and close
</button>

<form [formGroup]="sampleForm" puiForm [enableDirtyFormNavigationGuard]="true">
  ...
</form>
```

```ts
export class SampleFormComponent {
  readonly sampleForm = formGroup.withBuilder(({ control }) => ({
    name: control<string | null>(null),
  }));

  readonly saveCommand = command.actionSaveForm(
    this.sampleForm,
    async (args: { navigateBackToList: boolean }) => {
      await api.saveSample(this.sampleForm.value);

      if (args.navigateBackToList) {
        this.router.navigate(["/list"]);
      }
    }
  );
}
```

For everything to work, `providePracticesKtbe` must be configured in the `app.config.ts`.

Additionally, to display error messages and progress spinners, the `puibe-status-hub` must be instantiated globally in the application:

```html
<puibe-status-hub>
  <ng-container *puibeIfErrorStatus="let status">
    Something went wrong!
    <puibe-expansion-panel
      *ngIf="status.error?.stack ?? status.error?.message"
      caption="Details"
      class="flex-grow-0 text-black"
      [enableContentScroll]="true"
    >
      <code *ngIf="status.error.stack" class="whitespace-pre">
        {{ status?.error.stack ?? status.error?.message }}</code
      >
    </puibe-expansion-panel>
  </ng-container>
</puibe-status-hub>
```

## Integration Commands, StatusService, DirtyGuard (Legacy)

**Note:** This variant is based on code that has already been **deprecated**.

The new constructs are integrated with each other.

A typical use case would be, for example, a save button that must perform validations, etc.:

```html
<!-- save-controls.component.html -->
<button
  puibeButton
  [clickCommand]="trySaveCommandSignal()"
  [commandOptions]="{ statusCategory: 'action-save' }"
  variant="primary"
>
  Save
</button>
<button
  puibeButton
  [clickCommand]="trySaveCommandSignal()"
  [commandArgs]="{ navigateBackToList: true }"
  [commandOptions]="{ statusCategory: 'action-save' }"
>
  Save and close
</button>
```

```ts
// Generic component that could be used from within your form page
export class SaveControlsComponent {
  private readonly _dirtyGuard = inject(PuibeGlobalDirtyGuardDirective);

  @Input() form: FormGroup;

  private _saveCommandSignal = signal<ICommand>(null);
  @Input() set saveCommand(value: ICommand) {
    // The `ICommand` interface allows passing raw functions or real commands.
    this._saveCommandSignal.set(value);
  }

  readonly trySaveCommandSignal = computed(() =>
    // Wrap the passed-in command and add the before- and after-execute handlers
    Command.from(this._saveCommandSignal(), {
      beforeExecuteHandler: this.onBeforeSave,
      afterExecuteHandler: this.onAfterSave,
    })
  );

  readonly onBeforeSave = (params?: { navigateBackToList: boolean }) => {
    if (this.form.invalid) {
      setTimeout(() => {
        // Find the first invalid control and bring it into view
        const firstInvalidControl = document.querySelector(
          "main [formcontrolname].ng-invalid"
        );
        if (firstInvalidControl) {
          firstInvalidControl.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      // Perform any extra validation before saving,
      // and if invalid throw an error to notify the user and cancel the operation.
      throw new InvalidFormularError(
        "Please make sure all form fields are valid!"
      );
    } else if (params?.navigateBackToList) {
      // Temporary disable dirty guard to allow navigation.
      this._dirtyGuard.disabled = true;
    }
  };

  readonly onAfterSave = (
    result: CommandAfterExecuteResult<{ navigateBackToList: boolean }>
  ) => {
    if (!result.error) {
      this.form.markAsPristine();
      this.form.markAsUntouched();

      if (result.args?.navigateBackToList) {
        this.router.navigate(["../"]); // Normally this would be configurable or done by the passed-in command itself
      }
    }
    // After save is complete/failed, re-enable the dirty guard.
    this._dirtyGuard.disabled = false;
  };
}
```

### Action Dialog (`practices-ui-ktbe`)

The `PuibeActionDialogService` facilitates prompting the user for a choice of options while staying within the flow of the code.

Example:

```ts
private readonly _actionDialog = inject(PuibeActionDialogService);

public async confirmUserHasReadTerms() {
    const result = await this._actionDialog.showAsync({
        title: 'Terms of service',
        content: 'Please confirm that you read this.',
        actions: [PUIBE_DIALOG_ACTIONS.CONFIRM, PUIBE_DIALOG_ACTIONS.CANCEL],
    });

    if (result === PUIBE_DIALOG_ACTIONS.CONFIRM) {
        // User has confirmed, continue....
    }
}
```

#### Presets

There are also presets for common actions:

```ts
onDelete = async (): Promise<void> => {
  const result = await this.actionDialogService.showAsync(
    PUIBE_DIALOG_PRESETS.confirmDelete(() =>
      this.someApiProxy.deleteSomething(id)
    )
  );

  // Result will either be `false`, if the user has canceled, or it will be the actual value returned by the `this.someApiProxy.deleteSomething` call.
  if (result) {
    // Do something with result...
    this.statusService.showSuccessMessage(
      `The item ${result.name} was deleted!`
    );
    this.navigateBackToList();
  }
};
```

#### Usage with commands

By the way, when combining action dialogs and commands, there is a shorthand syntax:

```ts
readonly deleteCommand = this.actionDialogService.createShowCommand(
    PUIBE_DIALOG_PRESETS.confirmDelete((id: number) =>
      this.someApiProxy.deleteSomething(id)
    )
);
```

```html
<button puibeButton [clickCommand]="deleteCommand" [commandArgs]="item.id">
  ...
</button>
```

#### Custom dialog template content

The content of the dialog can be a string, but also a custom `TemplateRef` or `Component`:

```ts
@Component(...)
class MyCustomTermsOfServiceComponent {
  readonly data = inject<SomeCustomData>(DIALOG_DATA);
  ...
}

...
this._actionDialog.showAsync({
    title: 'Terms of service',
    content: MyCustomTermsOfServiceComponent,
    actions: [PUIBE_DIALOG_ACTIONS.CONFIRM, PUIBE_DIALOG_ACTIONS.CANCEL],
}, {data: someCustomData});
```

#### Custom presets

If the presets do not suffice, it is possible to define custom templates.
The definition of the types is a bit cumbersome, but the benefit is that it results in a strongly typed API.

```ts
// Define a preset function (This is basically how the default `PUIBE_DIALOG_PRESETS` are defined)
const myCustomDeleteDialogPreset = <TResult, TArgs = void>(
  deleteAction: ICommand<TArgs, TResult>
): PuibeActionDialogConfig<
  typeof PUIBE_DIALOG_ACTIONS.DELETE | typeof PUIBE_DIALOG_ACTIONS.CANCEL,
  TResult | false,
  typeof PUIBE_DIALOG_ACTIONS,
  TArgs
> => ({
  actions: {
    DELETE: Command.from(deleteAction, { statusCategory: "action-delete" }),
    CANCEL: false,
  },
  titleKey: "Practices.Labels_Delete",
  contentKey: "Practices.Labels_DeletePrompt",
});

// The usage now is strongly typed and the compiler will help with the syntax.
const result = await this._actionDialog.showAsync(
  myCustomDeleteDialogPreset(() => deleteSomething())
);
```

If the available buttons in `PUIBE_DIALOG_ACTIONS` are not enough, you can also create your own actions template

```ts

// Create a custom button template
const customActionsTemplate = {
  CALCULATE_ANSWER: { label: "Calculate answer to everything", primary: true },
  CANCEL: PUIBE_DIALOG_ACTIONS.CANCEL,
} satisfies PuibeDialogActionsTemplates;

const myCustomActionsDialogPreset = <TResult, TArgs = void>(
  action: ICommand<TArgs, TResult>
): PuibeActionDialogConfig<
  typeof customActionsTemplate.CALCULATE_ANSWER | typeof customActionsTemplate.CANCEL,
  TResult | false,
  typeof customActionsTemplate,
  TArgs
> => ({
  actions: {
    CALCULATE_ANSWER: action,
    CANCEL: false,
  },
  ...
});
```
