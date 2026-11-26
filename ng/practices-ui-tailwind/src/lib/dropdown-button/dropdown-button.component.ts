import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { AfterContentChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { PuiButtonDirective, Size } from '../button/button.directive';
import { PuiIconArrowComponent } from '../icons/icon-arrow.component';

export interface DropdownMenuOption {
    routerLink?: string;
    queryParams?: object;
    onClickHandler?: (option: DropdownMenuOption) => void;
    labelTranslationKey?: string;
    labelContent?: any;
    iconTemplate?: TemplateRef<any>;
}

const LEFT_ALIGNED_MENU_POSITION: ConnectedPosition = {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
};

const RIGHT_ALIGNED_MENU_POSITION: ConnectedPosition = {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
};

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-dropdown-button',
    templateUrl: './dropdown-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        PuiButtonDirective,
        PuiIconArrowComponent,
        CdkMenu,
        CdkMenuItem,
        CdkMenuTrigger,
        TranslateModule,
    ],
})
export class PuiDropdownButtonComponent implements AfterViewInit, AfterContentChecked, OnDestroy {
    private _router = inject(Router);

    private _menuMinWidthSubject = new BehaviorSubject<string>('');
    private _buttonPaddingLeftPxSubject = new BehaviorSubject<number>(0);
    private _buttonPaddingRightPxSubject = new BehaviorSubject<number>(0);

    readonly uniqueId = nextUniqueId++;
    readonly uniqueIdTrigger = `dropdown-trigger-${this.uniqueId}`;
    readonly menuMinWidth$ = this._menuMinWidthSubject.asObservable();
    readonly buttonPaddingLeftPx$ = this._buttonPaddingLeftPxSubject.asObservable();
    readonly buttonPaddingRightPx$ = this._buttonPaddingRightPxSubject.asObservable();

    @ViewChild('triggerButton', { static: true })
    triggerButton: ElementRef;

    @Input()
    options: DropdownMenuOption[];

    @Input()
    hideArrows = false;

    @Input()
    size: Size = 'large';

    @Input()
    menuPositions: ConnectedPosition[];

    @Input()
    menuAlignment: 'left' | 'right' = 'left';

    @Output()
    menuOpen: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    menuClose: EventEmitter<void> = new EventEmitter<void>();

    // CdkMenu menu should handle this aria state, but it doesn't set to false when closing via click outside of menu, so we do it manually
    isExpanded = false;

    ngAfterViewInit(): void {
        this.computeMenuStyles();
    }

    ngAfterContentChecked(): void {
        this.computeMenuStyles();
    }

    ngOnDestroy() {
        this._menuMinWidthSubject.complete();
        this._buttonPaddingLeftPxSubject.complete();
        this._buttonPaddingRightPxSubject.complete();
    }

    handleOpen(): void {
        this.menuOpen.emit();
        this.isExpanded = true;
    }

    handleClose(): void {
        this.menuClose.emit();
        this.isExpanded = false;
    }

    handleMenuItemTriggered(option: DropdownMenuOption): void {
        if (option.onClickHandler) {
            option.onClickHandler(option);
        }

        // setting on button directly is not compatible with cdkMenuItem
        if (option.routerLink) {
            this._router.navigate([option.routerLink], { queryParams: option.queryParams });
        }
    }

    getMenuPositions(): ConnectedPosition[] {
        if (this.menuPositions) {
            return this.menuPositions;
        }

        switch (this.menuAlignment) {
            case 'left':
                return [LEFT_ALIGNED_MENU_POSITION];
            case 'right':
                return [RIGHT_ALIGNED_MENU_POSITION];
            default:
                return [LEFT_ALIGNED_MENU_POSITION];
        }
    }

    // match the menu's width and padding with the button triggering it
    private computeMenuStyles(): void {
        if (this.triggerButton == null) {
            return;
        }

        this._menuMinWidthSubject.next(`${this.triggerButton.nativeElement.clientWidth}px`);

        const computedStyles = window.getComputedStyle(this.triggerButton.nativeElement);
        this._buttonPaddingLeftPxSubject.next(parseInt(computedStyles.paddingLeft));
        this._buttonPaddingRightPxSubject.next(parseInt(computedStyles.paddingRight));
    }
}

