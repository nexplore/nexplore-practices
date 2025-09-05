import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';

import { DialogComponent } from './dialog.component';

@NgModule({
    imports: [DialogComponent],
    exports: [PortalModule, DialogComponent],
})
export class DialogModule {}
