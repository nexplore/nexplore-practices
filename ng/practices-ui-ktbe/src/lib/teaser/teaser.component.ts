import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Optional, Output } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { PuibeMigratingClickCommandHostDirective } from '../command/migrating-click-command-host.directive';
import { PuibeIconArrowComponent } from '../icons/icon-arrow.component';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'puibe-teaser',
    templateUrl: './teaser.component.html',
    imports: [PuibeIconArrowComponent, NgClass, NgIf],
    hostDirectives: [
        {
            directive: forwardRef(() => PuibeMigratingClickCommandHostDirective),
            inputs: ['clickCommand', 'commandOptions', 'commandArgs'],
        },
    ],
})
export class PuibeTeaserComponent {
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

    constructor(
        @Optional() private readonly _router: Router,
        @Optional() private readonly _activatedRoute: ActivatedRoute
    ) {}

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
