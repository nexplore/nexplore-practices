
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './misc.component.html',
    imports: [TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscComponent {}
