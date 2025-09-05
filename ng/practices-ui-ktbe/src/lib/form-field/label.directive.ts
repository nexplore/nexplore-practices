import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { BehaviorSubject, combineLatest, Observable, takeUntil } from 'rxjs';
import { combineLatestWith } from 'rxjs/operators';
import { setHostAttr, setHostClassNames } from '../util/utils';
import { PuibeFormFieldComponent } from './form-field.component';
import { FormFieldService } from './form-field.service';

const className =
    'z-20 text-very-small absolute -top-5 left-6 bg-white rounded-lg px-1 py-0.5 transition-all duration-200 ease-out';
const invalidClassName = 'text-red';
const visibleClassName = 'translate-y-2 opacity-100';
const hiddenClassName = 'translate-y-7 opacity-0';

@Directive({
    standalone: true,
    selector: 'label[puibeLabel]',
    providers: [DestroyService],
})
export class PuibeLabelDirective implements OnInit {
    private _alwaysVisibleSubject = new BehaviorSubject<boolean>(false);

    @Input()
    set alwaysVisible(value: boolean) {
        this._alwaysVisibleSubject.next(value);
    }

    @HostBinding('class')
    className = className;

    constructor(
        private _elementRef: ElementRef<HTMLLabelElement>,
        private _formFieldService: FormFieldService,
        private _formFieldComponent: PuibeFormFieldComponent,
        private _destroy$: DestroyService
    ) {}

    ngOnInit() {
        this._formFieldService.id$
            .pipe(takeUntil(this._destroy$))
            .subscribe((id) => setHostAttr('for', id, this._elementRef));

        combineLatest([this._alwaysVisibleSubject, this._formFieldComponent.shouldShowLabelAboveField$])
            .pipe(takeUntil(this._destroy$))
            .subscribe(([alwaysVisible, shouldShowLabelAboveField]) => {
                const hidden = !shouldShowLabelAboveField && !alwaysVisible;
                setHostClassNames({ [hiddenClassName]: hidden, [visibleClassName]: !hidden }, this._elementRef);
            });

        this._formFieldService.displayAsInvalid$
            .pipe(takeUntil(this._destroy$))
            .subscribe((displayAsInvalid) =>
                setHostClassNames({ [invalidClassName]: displayAsInvalid }, this._elementRef)
            );

        this._getLabelText$()
            .pipe(combineLatestWith(this._alwaysVisibleSubject), takeUntil(this._destroy$))
            .subscribe(([labelText, alwaysVisible]) => {
                if (!alwaysVisible) {
                    this._formFieldService.setLabelAsPlaceholder(labelText);
                } else {
                    this._formFieldService.setLabelAsPlaceholder(null);
                }
            });
    }

    getLabel() {
        return this._elementRef.nativeElement.innerText;
    }

    private _getLabelText$() {
        return new Observable<string>((subscriber) => {
            const observer = new MutationObserver(() => {
                subscriber.next(this._elementRef.nativeElement.innerText);
            });

            // Observe both child list and character data, to be sure the change gets triggered (see https://www.quirksmode.org/dom/events/tests/mutation.html)
            observer.observe(this._elementRef.nativeElement, { childList: true, characterData: true, subtree: true });

            subscriber.next(this._elementRef.nativeElement.innerText);

            return () => {
                observer.disconnect();
            };
        });
    }
}
