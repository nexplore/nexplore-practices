import { Directive, TemplateRef, inject } from '@angular/core';
import { StatusTemplateContext } from '../status-toast/status-toast.component';

@Directive({
    selector: '[puibeIfErrorStatus]',
    standalone: true,
})
export class PuibeErrorStatusDirective {
    readonly templateRef = inject<TemplateRef<StatusTemplateContext<any>>>(TemplateRef);

    // Make sure the template checker knows the type of the context with which the
    // template of this directive will be rendered
    static ngTemplateContextGuard(
        _directive: PuibeErrorStatusDirective,
        context: unknown
    ): context is StatusTemplateContext<any> {
        return true;
    }
}
