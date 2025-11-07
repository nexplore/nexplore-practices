import { NgClass } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { PuibeMigratingClickCommandHostDirective } from '../command/migrating-click-command-host.directive';
import { PuibeIconArrowComponent } from '../icons/icon-arrow.component';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'puibe-teaser',
    templateUrl: './teaser.component.html',
    imports: [PuibeIconArrowComponent, NgClass],
    hostDirectives: [
        {
            directive: forwardRef(() => PuibeMigratingClickCommandHostDirective),
            inputs: ['clickCommand', 'commandOptions', 'commandArgs'],
        },
    ],
})
export class PuibeTeaserComponent {
    private readonly _router = inject(Router, { optional: true });
    private readonly _activatedRoute = inject(ActivatedRoute, { optional: true });

    @Input()
    title: string;

    @Input()
    titleLevel = '5';

    @Input()
    subtitle: string;

    @Input()
    subtitleLevel = '6';

    @Input()
    teaserLink: string | string[]; // TODO: Refactor html to use a/button depending on type (for accessibility reasons)

    @Input()
    navigatable: boolean;

    @Output()
    navigate = new EventEmitter<void>();

    @Input()
    variant: 'sand' | 'red' = 'sand';

    @Input()
    navigationExtras: NavigationExtras = undefined;

    private _id: string = (nextUniqueId++).toString();
    @Input()
    set id(value: string) {
        this._id = value;
    }

    get id() {
        return this._id;
    }

    onNavigate() {
        if (this.teaserLink) {
            this._router.navigate(
                Array.isArray(this.teaserLink) ? this.teaserLink : [this.teaserLink],
                this.navigationExtras ?? { relativeTo: this._activatedRoute }
            );
        }

        this.navigate?.emit();
    }
}
