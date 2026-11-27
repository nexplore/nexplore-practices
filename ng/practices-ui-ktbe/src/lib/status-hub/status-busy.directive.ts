import { Directive, TemplateRef, inject } from '@angular/core';
import { AggregatedStatusInfo } from '@nexplore/practices-ui';

export type BusyStatusTemplateContext = {
    /** The aggregated status of all running operations */
    $implicit: AggregatedStatusInfo;

    /** The resolved (translated) progress message */
    message: string;
};

/**
 * Allows to customize the content of the progress message toast shown by the `puibe-status-hub`, while an operation with a progress message is busy.
 *
 * The spinner is still shown next to the custom content.
 *
 * @example
 * <puibe-status-hub>
 *     <ng-container *puibeIfBusyStatus="let status; message as message">{{ message }} ({{ status.numberOfBusyOperations }})</ng-container>
 * </puibe-status-hub>
 */
@Directive({
    selector: '[puibeIfBusyStatus]',
    standalone: true,
})
export class PuibeBusyStatusDirective {
    readonly templateRef = inject<TemplateRef<BusyStatusTemplateContext>>(TemplateRef);

    // Make sure the template checker knows the type of the context with which the
    // template of this directive will be rendered
    static ngTemplateContextGuard(
        _directive: PuibeBusyStatusDirective,
        _context: unknown
    ): _context is BusyStatusTemplateContext {
        return true;
    }
}
