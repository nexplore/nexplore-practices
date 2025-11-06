import { Component } from '@angular/core';
import { LegacyCommand } from '@nexplore/practices-ui';
import { PuibeButtonDirective } from '@nexplore/practices-ui-ktbe';
import { timer } from 'rxjs';

@Component({
    selector: 'app-legacy-commands',
    standalone: true,
    imports: [PuibeButtonDirective],
    templateUrl: './commands.component.html',
})
export class LegacyCommandsComponent {
    simpleCommand = LegacyCommand.create(() => {
        return timer(3000);
    });

    saveCommand = LegacyCommand.create(() => {
        return timer(6000);
    });

    deleteCommand = LegacyCommand.create(() => {
        return timer(6000);
    });

    blockingCommand = LegacyCommand.create(
        () => {
            return timer(4000);
        },
        {
            blocking: true,
        }
    );
}
