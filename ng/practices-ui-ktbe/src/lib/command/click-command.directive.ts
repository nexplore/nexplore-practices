import { Directive, inject, Input } from '@angular/core';
import { CombinedCommandInput } from '@nexplore/practices-ui';

import { PuibeMigratingClickCommandHostDirective } from './migrating-click-command-host.directive';

/**
 * @deprecated Use `PuiClickCommandDirective` instead from `@nexplore/practices-ng-commands`
 */
@Directive({
    selector: '[puibeClickCommand]',
    standalone: true,
    hostDirectives: [
        {
            directive: PuibeMigratingClickCommandHostDirective,
            inputs: ['clickCommand', 'commandArgs', 'commandOptions'],
        },
    ],
})
export class PuibeClickCommandDirective<TArgs, TResult, TCommandInput extends CombinedCommandInput<TArgs, TResult>> {
    private readonly _migratingClickCommandHostDirective = inject(
        PuibeMigratingClickCommandHostDirective<TArgs, TResult, TCommandInput>
    );

    @Input()
    set puibeClickCommand(v: '' | TCommandInput) {
        if (v !== '') {
            this._migratingClickCommandHostDirective.clickCommand = v;
        }
    }
}
