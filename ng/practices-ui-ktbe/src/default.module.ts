import { AsyncPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_FORM_COMPONENT_IMPORTS } from './form.module';

const DEFAULT_COMPONENT_IMPORTS = [
    TranslateModule,
    NgFor,
    NgIf,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    NgTemplateOutlet,
    ...DEFAULT_FORM_COMPONENT_IMPORTS,
];

@NgModule({
    imports: DEFAULT_COMPONENT_IMPORTS,
    exports: DEFAULT_COMPONENT_IMPORTS,
})
export class PracticesKtbeDefaultModule {}
