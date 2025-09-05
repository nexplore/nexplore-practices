import {
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    TemplateRef,
    untracked,
    ViewContainerRef,
} from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import { computedPipe } from '@nexplore/practices-ng-signals';

import { delay, EMPTY, Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Command } from '../commands/command.types';

type State = 'uninitialized' | 'loading' | 'error' | 'value';

const DEFAULT_LOADING_DEBOUNCE_TIME_MS = 500;
const DEFAULT_MIN_LOADING_TIME_MS = 700;

let counter = 0;

export interface AwaitQueryOptions {
    /**
     * The time to wait before showing the loading state, after the first time the result has already been displayed.
     *
     * default (milliseconds): 500
     */
    delayBetweenLoadingMs?: number;

    /**
     * The minimum time to show the loading state, to prevent too fast flickering.
     *
     * default (milliseconds): 700
     */
    minLoadingTimeMs?: number;
}

/**
 * Structural directive that waits for a query to complete and renders the result.
 *
 * Example:
 * ```html
 * <ng-container *puiAwaitQuery="myQuery; as: value">
 *     {{ value }}
 * </ng-container>
 * ```
 *
 * ```ts
 * protected readonly myQuery = command.query.withAutoTrigger(() => this._myApi.getSomethingAsync());
 * ```
 *
 * It also allows to define templates for the loading, error and empty states.
 */
@Directive({
    selector: '[puiAwaitQuery]',
    standalone: true,
})
export class PuiAwaitQueryDirective<T> {
    private readonly _template = inject(TemplateRef);
    private readonly _viewContainerRef = inject(ViewContainerRef);

    private readonly _stateSignal = signal<{ name: State; param?: unknown }>({ name: 'uninitialized' });

    private _currentSubscription?: Subscription;
    private _hasLoadedFirstTime = false;
    private _previousState?: State;
    private _previousLoadingTimestamp?: number;

    public readonly querySignal = input.required<Command<any, T>>({ alias: 'puiAwaitQuery' });

    public readonly optionsSignal = input<Partial<AwaitQueryOptions>>({}, { alias: 'puiAwaitQueryOptions' });

    public readonly loadingTemplateSignal = model<TemplateRef<void> | null>(null, { alias: 'puiAwaitQueryLoading' });
    public readonly loadingFirstTimeTemplateSignal = model<TemplateRef<void> | null>(null, {
        alias: 'puiAwaitQueryLoadingFirstTime',
    });
    public readonly errorTemplateSignal = model<TemplateRef<{
        $implicit: Error;
    }> | null>(null, { alias: 'puiAwaitQueryError' });
    public readonly emptyTemplateSignal = model<TemplateRef<{
        $implicit: T;
    }> | null>(null, { alias: 'puiAwaitQueryEmpty' });

    public readonly loading = output<boolean>();
    public readonly failure = output<Error | unknown>();
    public readonly success = output<T>();
    public readonly rendered = output<'error' | 'loading' | 'success' | 'empty'>();

    constructor() {
        effect(() => {
            const command = this.querySignal();
            this._currentSubscription?.unsubscribe();
            this._currentSubscription = new Subscription();

            this._currentSubscription.add(command.error$.subscribe((error) => this._setState('error', error)));

            this._currentSubscription.add(
                command.busy$.subscribe((busy) => {
                    if (busy) {
                        this._setState('loading');
                    }
                })
            );

            if (command.result) {
                this._setState('value', command.result);
            }

            // Notice when subscribing to the result of the command, it may or not also trigger it.
            this._currentSubscription.add(
                command.result$.subscribe((value) => {
                    trace('puiAwaitQuery', 'command:result', this.id, { value });
                    this._setState('value', value);
                })
            );
        });

        const stateDebouncedSignal = computedPipe(
            this._stateSignal,
            switchMap(({ name, param }): Observable<{ state: State; param?: unknown }> => {
                trace('puiAwaitQuery', 'stateDebouncedSignal', this.id, { name, param });
                switch (name) {
                    case 'uninitialized':
                        return EMPTY;
                    case 'loading': {
                        trace('puiAwaitQuery', 'loading', this.id, { willBeDelayed: this._hasLoadedFirstTime });
                        this.loading.emit(true);
                        const newState$ = of({ state: 'loading' as State });
                        return this._hasLoadedFirstTime
                            ? newState$.pipe(delay(this.getLoadingDebounceTimeMs()))
                            : newState$;
                    }
                    case 'error':
                        this.failure.emit(param);
                        this.loading.emit(false);
                        return this._delayIfWasStillLoading('error', param);
                    case 'value':
                        this.success.emit(param as T);
                        this.loading.emit(false);
                        return this._delayIfWasStillLoading('value', param);
                }
            })
        );

        effect(
            () => {
                const value = stateDebouncedSignal();
                if (!value) {
                    trace('puiAwaitQuery', 'no-value', this.id, value);
                    return;
                }

                const { state, param } = value;
                trace('puiAwaitQuery', 'effect', this.id, { state, param });
                untracked(() => {
                    switch (state) {
                        case 'loading':
                            this._handleLoading();
                            break;
                        case 'error':
                            this._handleError(param);
                            break;
                        case 'value':
                            this._handleResult(param as T);
                            break;
                    }
                });

                this._previousState = state;
            },
            { allowSignalWrites: true }
        );
    }

    protected readonly id = counter++;

    protected getLoadingDebounceTimeMs(): number {
        return this.optionsSignal()?.delayBetweenLoadingMs ?? DEFAULT_LOADING_DEBOUNCE_TIME_MS;
    }

    protected getMinLoadingTimeMs(): number {
        return this.optionsSignal()?.minLoadingTimeMs ?? DEFAULT_MIN_LOADING_TIME_MS;
    }

    private _setState(state: State, param?: unknown): void {
        trace('puiAwaitQuery', 'setState', this.id, { state, param });

        untracked(() => {
            this._stateSignal.set({ name: state, param });
        });
    }

    private _handleLoading(): void {
        this._previousLoadingTimestamp = performance.now();
        if (!this._hasLoadedFirstTime && this.loadingFirstTimeTemplateSignal()) {
            trace('puiAwaitQuery', 'handleLoadingFirstTime', this.id);
            this._viewContainerRef.clear();
            this._viewContainerRef.createEmbeddedView(this.loadingFirstTimeTemplateSignal()!).detectChanges();
            this.rendered.emit('loading');
        } else if (this.loadingTemplateSignal()) {
            trace('puiAwaitQuery', 'handleLoading', this.id);
            this._viewContainerRef.clear();
            this._viewContainerRef.createEmbeddedView(this.loadingTemplateSignal()!).detectChanges();
            this.rendered.emit('loading');
        }

        this._hasLoadedFirstTime = true;
    }

    private _handleError(error: any): void {
        this._viewContainerRef.clear();
        trace('puiAwaitQuery', 'handleError', this.id, { error });
        if (this.errorTemplateSignal()) {
            this._viewContainerRef
                .createEmbeddedView(this.errorTemplateSignal()!, { $implicit: error })
                .detectChanges();
            this.rendered.emit('error');
        }
    }

    private _handleResult(value: T): void {
        this._viewContainerRef.clear();

        trace('puiAwaitQuery', 'handleResult', this.id, {
            value,
            empty: this.emptyTemplateSignal(),
            template: this._template,
        });
        // Set timeout to prevent error: NG0602
        setTimeout(() => {
            const isEmpty = !value || (Array.isArray(value) && !value.length);
            if (this.emptyTemplateSignal() && isEmpty) {
                if (!this.querySignal().busy) {
                    this._viewContainerRef
                        .createEmbeddedView(this.emptyTemplateSignal()!, { $implicit: value })
                        .detectChanges();
                }
            } else {
                trace('puiAwaitQuery', 'handleResult:render', this.id, {
                    value,
                    template: this._template,
                });
                this._viewContainerRef.createEmbeddedView(this._template, { $implicit: value }).detectChanges();
            }
            this.rendered.emit(isEmpty ? 'empty' : 'success');
        });
    }

    private _delayIfWasStillLoading(newState: State, param?: unknown): Observable<{ state: State; param?: unknown }> {
        if (
            !this._hasLoadedFirstTime ||
            this._previousState !== 'loading' ||
            !this._previousLoadingTimestamp ||
            !this.getMinLoadingTimeMs()
        ) {
            return of({ state: newState, param });
        }

        const timeSinceLoading = performance.now() - this._previousLoadingTimestamp;
        if (timeSinceLoading < this.getMinLoadingTimeMs()) {
            const remainingTimeMs = this.getMinLoadingTimeMs() - timeSinceLoading;
            trace('puiAwaitQuery', 'delay', this.id, { newState, remainingTimeMs });
            return of({ state: newState, param }).pipe(delay(remainingTimeMs));
        } else {
            trace('puiAwaitQuery', 'no-delay (immediately)', this.id, { newState });
            return of({ state: newState, param });
        }
    }

    static ngTemplateContextGuard<T>(_dir: PuiAwaitQueryDirective<T>, ctx: unknown): ctx is { $implicit: T } {
        return true;
    }
}
