import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, inject } from '@angular/core';
import { PuiMarkControlService, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, combineLatestWith, map, of, switchMap, takeUntil } from 'rxjs';
import { PuiIconInvalidComponent } from '../icons/icon-invalid.component';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiCheckboxComponent } from './checkbox.component';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-checkbox-group',
    templateUrl: './checkbox-group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, PuiIconInvalidComponent, AsyncPipe, TranslateModule, PuiIconSpinnerComponent],
    providers: [DestroyService],
})
export class PuiCheckboxGroupComponent implements OnDestroy {
    private readonly _destroy$ = inject(DestroyService);
    private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _markControlService = inject(PuiMarkControlService, { optional: true });
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    @Input()
    readonlyEmptyValuePlaceholder: string;

    private readonly _hideOptionalSubject = new BehaviorSubject<boolean>(false);
    private readonly _checkboxesSubject = new BehaviorSubject<PuiCheckboxComponent[]>([]);
    private readonly _checkboxes$ = this._checkboxesSubject.asObservable();

    readonly id = 'pui-checkbox-group-' + nextUniqueId++;

    private readonly _allCheckboxesOptional$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.isRequired$),
                (...values) => values.every((v) => v === false),
            ),
        ),
    );

    readonly selectedCheckboxes$ = this._checkboxes$.pipe(
        map((checkboxes) => Array.from(checkboxes)), // unwrap checkboxes from queryList
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.checked$), // resolve the checked$ obs
                (...values) =>
                    values
                        .map((value, index) => {
                            return { label: checkboxes[index].label, checked: value }; // map checked value to checkbox label
                        })
                        .filter((value) => value.checked === true), // only checked checkboxes
            ),
        ),
    );

    // TODO: Rethink naming of all these observables. They are confusing in the sense that they are not affecting the underlying
    //       form-controls, but rather the visual representation of the control. E.g. `isOptional$` should be `displayAsOptional$`
    //       At the same time, the `invalid$` observable maybe deleted, since it is not used anywhere.
    readonly isOptional$ = this._allCheckboxesOptional$.pipe(
        combineLatestWith(this._hideOptionalSubject),
        map(([allCheckboxesOptional, hideOptional]) => allCheckboxesOptional && !hideOptional),
    );

    readonly invalid$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.invalid$),
                (...values) => values.some((v) => v === true),
            ),
        ),
    );

    readonly displayAsInvalid$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.displayAsInvalid$),
                (...values) => values.some((v) => v === true),
            ),
        ),
    );

    readonly pending$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.pending$),
                (...values) => values.some((v) => v === true),
            ),
        ),
    );

    readonly errors$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.errors$),
                (...errorArrays) =>
                    []
                        .concat(...errorArrays)
                        .filter((value, index, array) => array.findIndex((v2) => v2.key === value.key) === index),
            ),
        ),
    );

    readonly isReadonly$ = this._readonlyDirective?.isReadonly$ ?? of(false);

    readonly dirty$ = this._checkboxes$.pipe(
        switchMap((checkboxes) =>
            combineLatest(
                checkboxes.map((c) => c.dirty$),
                (...dirtyStates) => dirtyStates.some((dirty) => dirty),
            ),
        ),
    );

    @HostBinding('class')
    className = 'inline-block';

    @Input()
    legend: string;

    @Input()
    isLegendSrOnly = false;

    @Input()
    legendAsLabel = false;

    @Input()
    hint: string;

    @Input()
    displayInline = false;

    @Input()
    gapVariant: 'default' | 'large' = 'default';

    @Input()
    hideGroupBorder = false;

    @Input()
    set hideOptional(value: boolean) {
        this._hideOptionalSubject.next(value);
    }
    constructor() {
        this._markControlService?.touched$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this.markAsTouched();
        });
    }

    ngOnDestroy() {
        this._checkboxesSubject.complete();
    }

    markAsTouched() {
        this._checkboxesSubject.getValue().forEach((c) => c.markAsTouched());
    }

    /**
     * Registers a child checkbox to the group.
     *
     * This is used to keep track of all checkboxes in the group.
     * Note: the order is not guaranteed.
     *
     * @param checkbox The child checkbox to register.
     * @param _destroy$ A reference to the cihld checkbox's destroy$ observable.
     */
    registerChildCheckbox(checkbox: PuiCheckboxComponent, _destroy$: DestroyService) {
        this._checkboxesSubject.next([...this._checkboxesSubject.value, checkbox]);
        _destroy$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this._checkboxesSubject.next(this._checkboxesSubject.value.filter((c) => c !== checkbox));
        });
    }
}

