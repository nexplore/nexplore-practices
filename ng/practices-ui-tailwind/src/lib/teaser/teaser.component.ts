import { NgClass } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { PuiMigratingClickCommandHostDirective } from '../command/migrating-click-command-host.directive';
import { PuiIconArrowComponent } from '../icons/icon-arrow.component';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-teaser',
    templateUrl: './teaser.component.html',
    imports: [PuiIconArrowComponent, NgClass],
    hostDirectives: [
        {
            directive: forwardRef(() => PuiMigratingClickCommandHostDirective),
            inputs: ['clickCommand', 'commandOptions', 'commandArgs'],
        },
    ],
})
export class PuiTeaserComponent {
    private readonly _router = inject(Router, { optional: true });
    private readonly _activatedRoute = inject(ActivatedRoute, { optional: true });

    @Input()
    title = '';

    @Input()
    titleLevel = '5';

    @Input()
    subtitle = '';

    @Input()
    subtitleLevel = '6';

    @Input()
    teaserLink: string | string[] | null = null; // TODO: Refactor html to use a/button depending on type (for accessibility reasons)

    @Input()
    navigatable = false;

    @Output()
    navigate = new EventEmitter<void>();

    @Input()
    variant: 'highlight' | 'highlight-dark' | 'red' | 'brand' = 'highlight';

    @Input()
    navigationExtras: NavigationExtras | null = null;

    private _id: string = (nextUniqueId++).toString();
    @Input()
    set id(value: string) {
        this._id = value;
    }

    get id() {
        return this._id;
    }

    onNavigate() {
        if (this.teaserLink && this._router) {
            this._router
                .navigate(
                    Array.isArray(this.teaserLink) ? this.teaserLink : [this.teaserLink],
                    (this.navigationExtras as NavigationExtras) ?? { relativeTo: this._activatedRoute ?? undefined },
                )
                .catch(() => void 0);
        }

        this.navigate?.emit();
    }
}

