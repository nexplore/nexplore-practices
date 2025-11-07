import { Directive, effect, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PuiClickCommandDirective } from '@nexplore/practices-ng-commands';
import { trace } from '@nexplore/practices-ng-logging';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { PuibeMigratingClickCommandHostDirective } from '../command/migrating-click-command-host.directive';
import { setHostAttr, setHostClassNames } from '../util/utils';

export type Variant = 'primary' | 'secondary' | 'danger' | 'danger-primary' | 'accept' | 'accept-primary';
export type Size = 'large' | 'large-round' | 'small';

const className =
    'group inline-flex items-center justify-center gap-1 overflow-hidden no-underline rounded-full border border-solid transition-all ease-linear duration-200 aria-disabled:cursor-default';
const primaryClassNames = `bg-anthrazit text-white border-anthrazit hover:text-white focus:text-white aria-disabled:bg-gray aria-disabled:border-gray disabled:bg-gray disabled:border-gray`;
const secondaryClassNames = `bg-white text-black border-black hover:text-black focus:text-black aria-disabled:border-anthrazit aria-disabled:opacity-30 disabled:border-anthrazit disabled:opacity-30`;
const dangerClassNames =
    'bg-white text-red border-red hover:text-red focus:text-red aria-disabled:opacity-30 disabled:opacity-30';
const dangerPrimaryClassNames =
    'bg-red text-white border-red hover:text-white focus:text-white aria-disabled:opacity-30 disabled:opacity-30';
const acceptClassNames =
    'bg-white text-green border-green hover:text-green focus:text-green aria-disabled:opacity-30 disabled:opacity-30';
const acceptPrimaryClassNames =
    'bg-green text-white border-green hover:text-white focus:text-white aria-disabled:opacity-30 disabled:opacity-30';
const largeSizeClassNames = 'text-base font-medium h-12 py-3 px-10';
const largeRoundSizeClassNames = 'text-base font-medium h-12 w-12 py-3 px-4';
const smallSizeClassNames = 'text-small h-6 w-6 p-1';
const scaleClassNames = `hover:scale-105 focus:scale-105 aria-disabled:scale-100 disabled:scale-100`;

function variantClassNames(variant: Variant) {
    switch (variant) {
        case 'primary':
            return primaryClassNames;
        case 'secondary':
            return secondaryClassNames;
        case 'danger':
            return dangerClassNames;
        case 'danger-primary':
            return dangerPrimaryClassNames;
        case 'accept':
            return acceptClassNames;
        case 'accept-primary':
            return acceptPrimaryClassNames;
        default:
            return secondaryClassNames;
    }
}

function sizeClassNames(size: Size) {
    switch (size) {
        case 'large':
            return largeSizeClassNames;
        case 'large-round':
            return largeRoundSizeClassNames;
        case 'small':
            return smallSizeClassNames;
        default:
            return largeSizeClassNames;
    }
}

@Directive({
    standalone: true,
    selector: 'button[puibeButton], a[puibeButton]',
    hostDirectives: [
        {
            directive: PuibeMigratingClickCommandHostDirective,
            inputs: ['clickCommand', 'commandArgs', 'commandOptions'],
        },
    ],
})
export class PuibeButtonDirective implements OnInit, OnDestroy {
    private _elementRef = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);

    private _variantSubject = new BehaviorSubject<Variant>('secondary');
    private _sizeSubject = new BehaviorSubject<Size>('large');
    private _busySubject = new BehaviorSubject<boolean>(false);
    private _scaleOnHoverSubject = new BehaviorSubject<boolean>(true);
    private _disabled: boolean;
    private _disabledOverride: boolean;

    readonly variant$ = this._variantSubject.asObservable();
    readonly size$ = this._sizeSubject.asObservable();
    readonly busy$ = this._busySubject.asObservable();

    @Input()
    set variant(value: Variant) {
        this._variantSubject.next(value);
    }

    get variant() {
        return this._variantSubject.value;
    }

    @Input()
    set size(value: Size) {
        this._sizeSubject.next(value);
    }

    get size() {
        return this._sizeSubject.value;
    }

    @Input()
    set busy(value: boolean) {
        this._busySubject.next(value);
    }

    get busy() {
        return this._busySubject.value;
    }

    @Input()
    set scaleOnHover(value: boolean) {
        this._scaleOnHoverSubject.next(value);
    }

    get scaleOnHover() {
        return this._scaleOnHoverSubject.value;
    }

    @Input()
    set disabled(value: boolean) {
        this._disabled = value;
        this._updateDisabledAttribute();
    }

    get disabled() {
        return this._disabled;
    }

    @Input()
    type?: string;

    /**
     * If `true` disables the new default animation behavior, which somehwat smoothes out the scale animation, but may impact performance.
     *
     * @internal @deprecated This property is experimental, and might get removed in the future
     **/
    @Input()
    disableSmoothAnimationTransform: boolean;

    constructor() {
        const clickCommandDirective = inject(PuiClickCommandDirective);

        effect(() => {
            const command = clickCommandDirective.commandSignal();
            if (command) {
                trace(
                    'puibeClickCommand',
                    this._elementRef.nativeElement,
                    'Setting busy signal',
                    command.busySignal(),
                    this
                );
                this.busy = command.busySignal();
            }
        });
    }

    ngOnInit() {
        combineLatest([this._variantSubject, this._sizeSubject, this._scaleOnHoverSubject]).subscribe(
            ([variant, size, scaleOnHover]) =>
                setHostClassNames(
                    {
                        [className]: true,
                        [variantClassNames(variant)]: true,
                        [sizeClassNames(size)]: true,
                        [scaleClassNames]: scaleOnHover === true,
                        ['will-change-transform']: scaleOnHover && !this.disableSmoothAnimationTransform,
                    },
                    this._elementRef
                )
        );

        this._busySubject.subscribe(() => this._updateDisabledAttribute());

        if (this._elementRef.nativeElement.tagName === 'BUTTON' && !this.type) {
            this._elementRef.nativeElement.type = 'button';
        }
    }

    ngOnDestroy() {
        this._variantSubject.complete();
        this._sizeSubject.complete();
        this._busySubject.complete();
        this._scaleOnHoverSubject.complete();
    }

    overrideDisabled(value: boolean) {
        this._disabledOverride = value;
        this._updateDisabledAttribute();
    }

    private _updateDisabledAttribute() {
        setTimeout(() => {
            setHostAttr('disabled', this._disabledOverride || this.disabled, this._elementRef);

            setHostAttr('aria-disabled', this._busySubject.value ? 'true' : null, this._elementRef);
        });
    }
}
