import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { PuibeIconGoBackComponent } from '../icons/icon-go-back.component';
import { PuibeIconGoNextComponent } from '../icons/icon-go-next.component';
import { setHostClassNames } from '../util/utils';
import { PuibeButtonDirective, Variant as ButtonVariant } from './button.directive';

type Variant = 'left-arrow' | 'right-arrow';

const leftArrowClassNames = '-mr-11 -ml-2';
const rightArrowClassNames = '-ml-10 -mr-3';

@Component({
    standalone: true,
    selector: 'puibe-button-arrows',
    templateUrl: './button-arrows.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuibeIconGoBackComponent, PuibeIconGoNextComponent, NgIf, NgClass, AsyncPipe],
})
export class PuibeButtonArrowsComponent implements OnInit, OnDestroy {
    private _variantSubject = new BehaviorSubject<Variant>('right-arrow');

    readonly fillClassName$ = this._parentButtonDirective.variant$.pipe(map((variant) => this.fillClassName(variant)));

    @Input()
    set variant(value: Variant) {
        this._variantSubject.next(value);
    }

    get variant() {
        return this._variantSubject.getValue();
    }

    constructor(private _parentButtonDirective: PuibeButtonDirective, private _elementRef: ElementRef) {}

    ngOnInit() {
        this._variantSubject.subscribe((variant) =>
            setHostClassNames(
                {
                    [leftArrowClassNames]: variant === 'left-arrow',
                    [rightArrowClassNames]: variant === 'right-arrow',
                },
                this._elementRef
            )
        );
    }

    ngOnDestroy() {
        this._variantSubject.complete();
    }

    private fillClassName(variant: ButtonVariant) {
        switch (variant) {
            case 'primary':
            case 'danger-primary':
            case 'accept-primary':
                return 'fill-white';
            case 'secondary':
                return 'fill-black';
            case 'danger':
                return 'fill-red';
            case 'accept':
                return 'fill-green';
            default:
                return 'fill-black';
        }
    }
}
