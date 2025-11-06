import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PuibeSideNavigationComponent } from '@nexplore/practices-ui-ktbe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './misc.component.html',
    imports: [PuibeSideNavigationComponent, DatePipe, NgFor, NgIf, TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscComponent {}
