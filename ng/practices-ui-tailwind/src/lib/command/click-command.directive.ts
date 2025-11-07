import { Directive, inject, Input } from '@angular/core';
import { CombinedCommandInput } from '@nexplore/practices-ui';

import { PuiMigratingClickCommandHostDirective } from './migrating-click-command-host.directive';

/**
 * @deprecated Use `PuiClickCommandDirective` instead from `@nexplore/practices-ng-commands`
 */
@Directive({
    selector: '[puiClickCommand]',
    standalone: true,
    hostDirectives: [
        {
            directive: PuiMigratingClickCommandHostDirective,
            inputs: ['clickCommand', 'commandArgs', 'commandOptions'],
        },
    ],
})
export class PuiClickCommandDirective<TArgs, TResult, TCommandInput extends CombinedCommandInput<TArgs, TResult>> {
    private readonly _migratingClickCommandHostDirective = inject(
        PuiMigratingClickCommandHostDirective<TArgs, TResult, TCommandInput>,
    );

    @Input()
    set puiClickCommand(v: '' | TCommandInput) {
        if (v !== '') {
            this._migratingClickCommandHostDirective.clickCommand = v;
        }
    }
}

