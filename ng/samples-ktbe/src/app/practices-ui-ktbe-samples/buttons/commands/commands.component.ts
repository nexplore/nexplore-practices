import { Component } from '@angular/core';
import { command } from '@nexplore/practices-ng-commands';
import { PuibeButtonDirective } from '@nexplore/practices-ui-ktbe';
import { timer } from 'rxjs';

@Component({
    selector: 'app-commands',
    standalone: true,
    imports: [PuibeButtonDirective],
    templateUrl: './commands.component.html',
})
export class CommandsComponent {
    simpleCommand = command.action(() => {
        return timer(3000);
    });

    saveCommand = command.action(
        () => {
            return timer(6000);
        },
        {
            status: {
                progressMessage: 'I have a custom message when saving...',
            },
        }
    );

    deleteCommand = command.actionDelete(() => {
        return timer(6000);
    });

    blockingCommand = command.action(
        () => {
            return timer(4000);
        },
        { status: { blocking: true } }
    );
}
