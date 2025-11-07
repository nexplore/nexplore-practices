import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { PuiIconGoBackComponent } from '../icons/icon-go-back.component';
import { PuiIconGoNextComponent } from '../icons/icon-go-next.component';
import { setHostClassNames } from '../util/utils';
import { Variant as ButtonVariant, PuiButtonDirective } from './button.directive';

type Variant = 'left-arrow' | 'right-arrow';

const leftArrowClassNames = '-mr-11 -ml-2';
const rightArrowClassNames = '-ml-10 -mr-3';

@Component({
    standalone: true,
    selector: 'pui-button-arrows',
    templateUrl: './button-arrows.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuiIconGoBackComponent, PuiIconGoNextComponent, NgClass, AsyncPipe],
})
export class PuiButtonArrowsComponent implements OnInit, OnDestroy {
    private _parentButtonDirective = inject(PuiButtonDirective);
    private _elementRef = inject(ElementRef);

    private _variantSubject = new BehaviorSubject<Variant>('right-arrow');

    readonly fillClassName$ = this._parentButtonDirective.variant$.pipe(map((variant) => this.fillClassName(variant)));

    @Input()
    set variant(value: Variant) {
        this._variantSubject.next(value);
    }

    get variant() {
        return this._variantSubject.getValue();
    }

    ngOnInit() {
        this._variantSubject.subscribe((variant) =>
            setHostClassNames(
                {
                    [leftArrowClassNames]: variant === 'left-arrow',
                    [rightArrowClassNames]: variant === 'right-arrow',
                },
                this._elementRef,
            ),
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
                return 'fill-brand';
            case 'accept':
                return 'fill-green';
            default:
                return 'fill-black';
        }
    }
}

