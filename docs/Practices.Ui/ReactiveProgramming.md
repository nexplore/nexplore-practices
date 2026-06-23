# Reactive Programming and Signals

Reactivity is an important concept in Angular, and there are two libraries that implement reactive programming in a different way:

- [Angular Signals](https://angular.dev/guide/signals)
- RxJs, see the [offical Angular Docs](https://angular.dev/ecosystem/rxjs-interop/output-interop) and [RxJs Docs](https://rxjs.dev/guide/overview)

Additionally, the practices library offers several packages, that aim to simplify reactive programming with signals, especially in a modern business web app.

## When to use which?

Generally, Signals is considered the new way to go forward, and should be used instead of Observables, if possible.

There are however cases, when using Rx Observables absolutely makes sense.
For example, a classic example would be an event stream of a user typing into an input, which in turn should call an api for receiving search results. This is done naturally with Rx Observables.

Example:

```ts
@Component({
  selector: "app-search",
  template: `
    <input type="text" [formControl]="searchForm.controls.keywords" />
    @for (result of results$ | async; track result) {
    <div>
      {{ result }}
    </div>
    }
  `,
})
export class SearchComponent {
  protected readonly searchForm = new FormGroup({
    keywords: new FormControl(""),
  });
  protected readonly results$ =
    this.searchForm.controls.keywords.valueChanges.pipe(
      debounceTime(300),
      switchMap((value) => this.searchService.search(value))
    );
}
```

Note, often, observables and signals can and should be combined, and with the help of some practices helper functions such as `computedPipe`, the same example as above can be written in a more signal based way:

```ts
@Component({
  selector: "app-search",
  template: `
    <input type="text" [formControl]="searchForm.controls.keywords" />
    @for (result of resultsSignal(); track result) {
    <div>
      {{ result }}
    </div>
    }
  `,
})
export class SearchComponent {
  protected readonly searchForm = formGroup.withBuilder(({ control }) => ({
    keywords: control<string | null>(null),
  }));

  protected readonly resultsSignal = computedPipe(
    () => this.searchForm.valueSignal.keywords(),
    debounceTime(300),
    switchMap((keywords) => this.searchService.search(keywords))
  );
}
```

In a real world application, we should take this a step further and consider errors, loading states, etc.
Thats why we would pack this into a query command:

```ts
@Component({
  selector: "app-search",
  template: `
    <input type="text" [formControl]="searchForm.controls.keywords" />
    <ng-container
      *puiAwaitQuery="
        searchQuery;
        as: results;
        loading: loadingTmpl;
        empty: emptyTmpl;
        error: errorTmpl
      "
    >
      @for (result of results; track result) {
      <div>
        {{ result }}
      </div>
      }
    </ng-container>
    <ng-template #loadingTmpl>Loading...</ng-template>
    <ng-template #emptyTmpl>No results</ng-template>
    <ng-template #errorTmpl>Error</ng-template>
  `,
})
export class SearchComponent {
  protected readonly searchForm = formGroup.withBuilder(({ control }) => ({
    keywords: control<string | null>(null),
  }));

  private readonly _keywordsDebouncedSignal = computedPipe(
    () => this.searchForm.valueSignal.keywords(),
    debounceTime(300)
  );
  protected readonly searchQuery = command.query.withSignalTrigger(
    this._keywordsDebouncedSignal,
    (keywords) => this.searchService.search(keywords)
  );
}
```

for more information on query commands, see [practices-ng-commands](/ng/practices-ng-commands/README.md)

## Observable vs Promise

When authoring services with methods, not all asynchronous operations should return Observables, as in most cases, using the classic `Promise` is more fitting:

```ts
getSomething$(): Observable<Something> {
    return interval(1000); // Use only for streams of data, that return multiple results, or run for a longer period of time
}

async getSomethingAsync(abortSignal?: AbortSignal): Promise<Something> {
    return await someApiCallAsync(abortSignal); // Use for singular results
}
```

If your api generates methods with observables (looking at you, NSWAG), the `firstValueFrom` helper is your friend:

```ts
async getSomethingAsync(abortSignal?: AbortSignal): Promise<Something> {
    const result = await firstValueFrom(this.getSomething$());
    // do something with result
    return result;
}
```

By the way, `AbortSignal` is a standard javascript construct, that has recently also [seen use in Resource Angular apis](https://angular.dev/api/core/resource), see [official MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).

## Input signals

Previously, it was pretty hard, to author components, that needed code to run dependent on the current value of an input. Often, one would decide, if an input was static or dynamic, and only then implement additional `ngOnChanges` logic. It was very error-prone.

With signals, this is much easier, and the code is reactive by default:

```ts
public readonly myInputSignal = input<string>('', {alias: 'myInput'});

protected readonly someComputedCssClass = withEffects(
    computed(() => {
        return this.myInputSignal() === 'someValue' ? 'some-class' : 'other-class';
    }),
    effect(() => {
        const cssClass = this.someComputedCssClass();
        console.log(cssClass); // Do something with the computed value
    });
);
```

## Signal queries

When authoring components, and you need to access the dom, you may use signal queries.

```ts
protected readonly viewChildElementSignal = viewChild('triggerButton', {read: ElementRef});
protected readonly contentChildElementSignal = contentChild('triggerButton', {read: ElementRef});
```

See also the [official Angular docs](https://angular.dev/guide/view-queries).

## Effects

Effects are the glue between signals, and any other non-standart behaviors.
The Practices Library offers some helper functions to work with effects.

### `withEffects`

Often, it's hard to keep signals and related effects together, and it's not nice to put all effects in the constructor, especially in bigger components.
Thats where the [withEffects](../../ng/practices-ng-signals/src/lib/effects-utils.ts) utility comes into play:

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

Note, it's not always possible to use `withEffects`, for example `input()` does not allow to use it because of the way angular compiler works.

### `subscriptionEffect`

Imagine an component, that has an input, and everytime the input changes, a Rx Observable needs to be subscribed to.

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

The practices library offers a new form group builder, that makes working with signals much easier.

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

For more information, see the [practices-ng-forms package](../../ng/practices-ng-forms/README.md).

## Commands

[Commands](/ng/practices-ng-commands/README.md) are a concept entirely new to angular, exclusive to Practices.
It was originally inspired by .NET WPF Commands.

Basically, for every button whose click handler triggers an asynchronous operation, a command would be the perfect fit.

```ts
// Before
@Component({
  template: `<button (click)="simpleAction()" [disabled]="isSimpleActionBusy">
    Click me
  </button>`,
})
class MyComponent {
  public constructor(private statusService: StatusService) {}
  protected isSimpleActionBusy: boolean = false;
  protected async simpleAction(): Promise<void> {
    this.isSimpleActionBusy = true;
    await this.statusService.register(this._api.doThisAndThat());
    this.isSimpleActionBusy = false;
  }
}

// New
@Component({
  template: `<button [puiClickCommand]="simpleCommand">Click me</button>`,
})
class MyComponent {
  protected readonly simpleCommand = command.action(() =>
    this._api.doThisAndThat();
  );
}
```

For more information, see the [practices-ng-commands package](/ng/practices-ng-commands/README.md)
