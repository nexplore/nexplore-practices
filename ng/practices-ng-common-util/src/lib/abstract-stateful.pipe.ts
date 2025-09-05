import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import { from, Observable, Subscription } from 'rxjs';

/**
 * @internal
 */
@Pipe({
    name: 'puiAbstractStateFulPipe',
    pure: false,
})
export abstract class AbstractStatefulPipe<TResult, TInput = any, TArgs extends Array<unknown> = any[]>
    implements OnDestroy, PipeTransform
{
    private _cdr = inject(ChangeDetectorRef);

    private _markForCheckOnValueUpdate = true;
    protected currentSubscription?: Subscription;
    protected _currentResult: TResult | undefined | null;

    private _previousInput?: TInput;
    private _previousArgs?: TArgs | [];

    ngOnDestroy(): void {
        this.currentSubscription?.unsubscribe();
    }

    transform(value: TInput, ...args: TArgs | []): TResult | undefined | null {
        if (
            this._previousInput !== value ||
            this._previousArgs?.length !== args.length ||
            !args.every((arg, i) => arg === this._previousArgs?.[i])
        ) {
            try {
                this._previousInput = value;
                this._previousArgs = args;
                const awaitable = this.transformAsync(value, ...(args as any));
                // Only call `markForCheck` if the value is updated asynchronously.
                // Synchronous updates _during_ subscription should not wastefully mark for check -
                // this value is already going to be returned from the transform function.
                this._markForCheckOnValueUpdate = false;

                let observable: Observable<TResult> | null = null;
                if (awaitable instanceof Promise) {
                    observable = from(awaitable);
                } else if (awaitable instanceof Observable) {
                    observable = awaitable;
                } else {
                    this._setResult(awaitable);
                }

                if (observable) {
                    this.currentSubscription?.unsubscribe();
                    this.currentSubscription = new Subscription();

                    this.currentSubscription.add(observable.subscribe((result) => this._setResult(result)));
                }
            } finally {
                this._markForCheckOnValueUpdate = true;
            }
        }

        return this._currentResult;
    }

    abstract transformAsync(input: TInput, ...args: TArgs): Observable<TResult> | Promise<TResult> | TResult | null;

    private _setResult(result: TResult | null): void {
        this._currentResult = result;

        trace('PipeAsyncHelper', 'setResult', { result });
        if (this._markForCheckOnValueUpdate) {
            this._cdr.markForCheck();
            trace('PipeAsyncHelper', 'mark cdr for check', this._cdr);
        }
    }
}
