import { Directive, effect, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PuiClickCommandDirective } from '@nexplore/practices-ng-commands';
import { trace } from '@nexplore/practices-ng-logging';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { PuiMigratingClickCommandHostDirective } from '../command/migrating-click-command-host.directive';
import { setHostAttr, setHostClassNames } from '../util/utils';

export type Variant = 'primary' | 'secondary' | 'neutral' | 'danger' | 'danger-primary' | 'accept' | 'accept-primary';
export type Size = 'large' | 'large-round' | 'small' | 'small-round' | 'default';

const className =
    'group inline-flex items-center justify-center gap-1 overflow-hidden no-underline rounded-button border border-solid transition-all ease-linear duration-200 aria-disabled:cursor-default';
const primaryClassNames = `bg-bgbutton-primary text-fgbutton-primary border-borderbutton-primary hover:text-white focus:text-white aria-disabled:bg-gray aria-disabled:border-gray disabled:bg-gray disabled:border-gray`;
const secondaryClassNames = `bg-bgbutton-default text-fgbutton-default border-borderbutton-default hover:text-black focus:text-black aria-disabled:border-bgbutton-primary aria-disabled:opacity-30 disabled:border-bgbutton-primary disabled:opacity-30`;
const neutralClassNames = `bg-background text-foreground border-borderbutton-default hover:text-foreground focus:text-foreground aria-disabled:opacity-30 disabled:opacity-30`;
const dangerClassNames =
    'bg-white text-red border-red hover:text-red focus:text-red aria-disabled:opacity-30 disabled:opacity-30';
const dangerPrimaryClassNames =
    'bg-brand text-white border-brand hover:text-white focus:text-white aria-disabled:opacity-30 disabled:opacity-30';
const acceptClassNames =
    'bg-white text-green border-green hover:text-green focus:text-green aria-disabled:opacity-30 disabled:opacity-30';
const acceptPrimaryClassNames =
    'bg-green text-white border-green hover:text-white focus:text-white aria-disabled:opacity-30 disabled:opacity-30';

const defaultSizeClassNames =
    'text-base font-medium h-button-size py-button-vertical-padding px-button-horizontal-padding';
const largeSizeClassNames = 'text-base font-medium h-button-size-lg py-3 px-10';
const largeRoundSizeClassNames = 'text-base font-medium h-button-size-lg w-button-size-lg py-3 px-4';
const smallSizeClassNames = 'text-small h-button-size-sm p-1';
const smallRoundSizeClassNames = 'text-small h-button-size-sm w-button-size-sm p-1 rounded-full';
const scaleClassNames = `hover:scale-105 focus:scale-105 aria-disabled:scale-100 disabled:scale-100`;

function variantClassNames(variant: Variant) {
    switch (variant) {
        case 'primary':
            return primaryClassNames;
        case 'secondary':
            return secondaryClassNames;
        case 'neutral':
            return neutralClassNames;
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
        case 'default':
            return defaultSizeClassNames;
        case 'large':
            return largeSizeClassNames;
        case 'large-round':
            return largeRoundSizeClassNames;
        case 'small':
            return smallSizeClassNames;
        case 'small-round':
            return smallRoundSizeClassNames;
        default:
            return largeSizeClassNames;
    }
}

@Directive({
    standalone: true,
    selector: 'button[puiButton], a[puiButton]',
    hostDirectives: [
        {
            directive: PuiMigratingClickCommandHostDirective,
            inputs: ['clickCommand', 'commandArgs', 'commandOptions'],
        },
    ],
})
export class PuiButtonDirective implements OnInit, OnDestroy {
    private _elementRef = inject<ElementRef<HTMLButtonElement | HTMLAnchorElement>>(ElementRef);

    private _variantSubject = new BehaviorSubject<Variant>('neutral');
    private _sizeSubject = new BehaviorSubject<Size>('default');
    private _busySubject = new BehaviorSubject<boolean>(false);
    private _scaleOnHoverSubject = new BehaviorSubject<boolean>(true);
    private _disabled = false;
    private _disabledOverride = false;

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
    disableSmoothAnimationTransform = false;

    constructor() {
        const clickCommandDirective = inject(PuiClickCommandDirective);

        effect(() => {
            const command = clickCommandDirective.commandSignal();
            if (command) {
                trace(
                    'puiClickCommand',
                    this._elementRef.nativeElement,
                    'Setting busy signal',
                    command.busySignal(),
                    this,
                );
                this.busy = command.busySignal();
            }
        });
    }

    private _classSub?: Subscription;
    private _busySub?: Subscription;

    ngOnInit() {
        this._classSub = combineLatest([this._variantSubject, this._sizeSubject, this._scaleOnHoverSubject]).subscribe(
            ([variant, size, scaleOnHover]) =>
                setHostClassNames(
                    {
                        [className]: true,
                        [variantClassNames(variant)]: true,
                        [sizeClassNames(size)]: true,
                        [scaleClassNames]: scaleOnHover === true,
                        ['will-change-transform']: scaleOnHover && !this.disableSmoothAnimationTransform,
                    },
                    this._elementRef,
                ),
        );
        this._busySub = this._busySubject.subscribe(() => this._updateDisabledAttribute());

        if (this._elementRef.nativeElement.tagName === 'BUTTON' && !this.type) {
            this._elementRef.nativeElement.type = 'button';
        }
    }

    ngOnDestroy() {
        this._variantSubject.complete();
        this._sizeSubject.complete();
        this._busySubject.complete();
        this._scaleOnHoverSubject.complete();
        this._classSub?.unsubscribe();
        this._busySub?.unsubscribe();
    }

    overrideDisabled(value: boolean) {
        this._disabledOverride = value;
        this._updateDisabledAttribute();
    }

    private _updateDisabledAttribute() {
        setTimeout(() => {
            setHostAttr('disabled', this._disabledOverride || this.disabled, this._elementRef);

            const ariaDisabled = this._busySubject.value ? 'true' : false;
            setHostAttr('aria-disabled', ariaDisabled, this._elementRef);
        });
    }
}

