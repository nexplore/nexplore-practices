import { Directive, effect, ElementRef, Input, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { DestroyService } from '@nexplore/practices-ui';
import { Observable, shareReplay, takeUntil } from 'rxjs';
import { combineLatestWith } from 'rxjs/operators';
import { setHostAttr, setHostClassNames } from '../util/utils';
import { FormFieldService } from './form-field.service';

const className =
    'z-20 text-very-small absolute bottom-full top-auto left-6 bg-white rounded-lg px-1 py-0.5 transition-all duration-200 ease-out';
const invalidClassName = 'text-red';
const visibleClassName = 'translate-y-2 opacity-100';
const hiddenClassName = 'translate-y-7 opacity-0';

@Directive({
    standalone: true,
    selector: 'label[puibeLabel]',
    providers: [DestroyService],
    host: { class: className },
})
export class PuibeLabelDirective implements OnInit {
    private readonly _alwaysVisibleSignal = signal(false);
    readonly alwaysVisibleSignal = this._alwaysVisibleSignal.asReadonly();

    @Input()
    set alwaysVisible(value: boolean) {
        this._alwaysVisibleSignal.set(value);
    }

    private readonly _heightSignal = signal(0);
    readonly heightSignal = this._heightSignal.asReadonly();

    private readonly _labelTextSignal = signal('');
    readonly labelTextSignal = this._labelTextSignal.asReadonly();

    private readonly _boundaryRightSignal = signal<number | null>(null);

    private readonly _shouldShowAboveSignal = signal(false);

    private readonly _alwaysVisible$ = toObservable(this.alwaysVisibleSignal);

    constructor(
        private _elementRef: ElementRef<HTMLLabelElement>,
        private _formFieldService: FormFieldService,
        private _destroy$: DestroyService
    ) {
        effect(() => {
            const boundary = this._boundaryRightSignal();
            const el = this._elementRef.nativeElement;
            el.style.maxWidth = boundary == null ? '' : `${Math.max(0, boundary - el.offsetLeft)}px`;
        });

        effect(() => {
            const hidden = !this._shouldShowAboveSignal() && !this.alwaysVisibleSignal();
            setHostClassNames({ [hiddenClassName]: hidden, [visibleClassName]: !hidden }, this._elementRef);
        });
    }

    ngOnInit() {
        this._formFieldService.id$
            .pipe(takeUntil(this._destroy$))
            .subscribe((id) => setHostAttr('for', id, this._elementRef));

        this._formFieldService.displayAsInvalid$
            .pipe(takeUntil(this._destroy$))
            .subscribe((displayAsInvalid) =>
                setHostClassNames({ [invalidClassName]: displayAsInvalid }, this._elementRef)
            );

        const labelText$ = this._getLabelText$().pipe(shareReplay({ refCount: true, bufferSize: 1 }));

        labelText$.pipe(takeUntil(this._destroy$)).subscribe((labelText) => this._labelTextSignal.set(labelText));

        labelText$
            .pipe(combineLatestWith(this._alwaysVisible$), takeUntil(this._destroy$))
            .subscribe(([labelText, alwaysVisible]) => {
                if (!alwaysVisible) {
                    this._formFieldService.setLabelAsPlaceholder(labelText);
                } else {
                    this._formFieldService.setLabelAsPlaceholder(null);
                }
            });

        this._observeHeight();
    }

    public setBoundaryRight(rightBoundaryPx: number | null): void {
        this._boundaryRightSignal.set(rightBoundaryPx);
    }

    public setShouldShowAbove(value: boolean): void {
        this._shouldShowAboveSignal.set(value);
    }

    private _observeHeight() {
        const el = this._elementRef.nativeElement;
        const observer = new ResizeObserver(() => this._heightSignal.set(el.offsetHeight));
        observer.observe(el);
        this._heightSignal.set(el.offsetHeight);

        this._destroy$.subscribe(() => observer.disconnect());
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
