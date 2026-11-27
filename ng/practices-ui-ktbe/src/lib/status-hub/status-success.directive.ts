import { Directive, TemplateRef, inject } from '@angular/core';
import { StatusTemplateContext } from '../status-toast/status-toast.component';

/**
 * Allows to customize the content of the success toasts shown by the `puibe-status-hub`.
 *
 * The context contains the status event (`$implicit`) and the resolved success message (`message`).
 *
 * @example
 * <puibe-status-hub>
 *     <ng-container *puibeIfSuccessStatus="let status; message as message">Done: {{ message }}</ng-container>
 * </puibe-status-hub>
 */
@Directive({
    selector: '[puibeIfSuccessStatus]',
    standalone: true,
})
export class PuibeSuccessStatusDirective {
    readonly templateRef = inject<TemplateRef<StatusTemplateContext<any>>>(TemplateRef);

    // Make sure the template checker knows the type of the context with which the
    // template of this directive will be rendered
    static ngTemplateContextGuard(
        _directive: PuibeSuccessStatusDirective,
        _context: unknown
    ): _context is StatusTemplateContext<any> {
        return true;
    }
}
