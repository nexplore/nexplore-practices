import { Component } from '@angular/core';
import {
    DropdownMenuOption,
    PuibeButtonArrowsComponent,
    PuibeButtonDirective,
    PuibeButtonSpinnerComponent,
    PuibeDropdownButtonComponent,
    PuibeIconLoginComponent,
} from '@nexplore/practices-ui-ktbe';
import { CommandsComponent } from './commands/commands.component';
import { LegacyCommandsComponent } from './legacy-commands/commands.component';

@Component({
    standalone: true,
    selector: 'app-buttons',
    templateUrl: './buttons.component.html',
    imports: [
        PuibeIconLoginComponent,
        PuibeButtonDirective,
        PuibeButtonArrowsComponent,
        PuibeButtonSpinnerComponent,
        PuibeDropdownButtonComponent,
        CommandsComponent,
        LegacyCommandsComponent,
    ],
})
export class ButtonsComponent {
    options1: DropdownMenuOption[] = [
        {
            labelContent: 'Hin zu den Form Elements',
            routerLink: '/form-elements',
        },
        {
            labelContent: 'Hin zu den Tables',
            routerLink: '/tables',
        },
        {
            labelContent: 'Hin zu den Popups',
            routerLink: '/popups',
        },
    ];

    options2: DropdownMenuOption[] = [
        {
            labelContent: 'Login via AD',
            onClickHandler: () => console.log('Login via AD clicked'),
        },
        {
            labelContent: 'Login via credentials',
            onClickHandler: () => console.log('Login via credentials clicked'),
        },
        {
            labelContent: 'Login via magic',
            onClickHandler: () => console.log('Login via magic clicked'),
        },
    ];

    options3: DropdownMenuOption[] = [
        {
            labelContent: 'Langer langer Text der Platz braucht',
            onClickHandler: () => console.log('Option 1 clicked'),
        },
        {
            labelContent: 'More text of text',
            onClickHandler: () => console.log('Option 2 clicked'),
        },
        {
            labelContent: 'And even some more that is text',
            onClickHandler: () => console.log('Option 3 clicked'),
        },
    ];

    menuOpenHandler(): void {
        console.log('Dropdown-Menü geöffnet');
    }

    menuCloseHandler(): void {
        console.log('Dropdown-Menü geschlossen');
    }

    customDropdownOptionHandler(): void {
        console.log('Very custom dropdown option clicked');
    }
}
