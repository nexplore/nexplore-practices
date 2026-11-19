import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './misc.component.html',
    imports: [TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscComponent {}
