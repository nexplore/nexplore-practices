import { Directive, ElementRef, HostListener, inject, model } from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import { createCommandFromInputSignal } from '../command-fluent-builder/create-command-from-input-signal';
import { CommandInput, CommandOptions } from '../commands/command.types';

@Directive({
    selector: '[puiClickCommand]',
    standalone: true,
})
export class PuiClickCommandDirective<TArgs, TResult> {
    private readonly _elementRef = inject(ElementRef<HTMLElement>);

    // TODO: Replace model with input, once PuibeClickCommandDirective is removed
    public readonly commandInputSignal = model<CommandInput<TArgs, TResult> | undefined | null>(null, {
        alias: 'puiClickCommand',
    });
    public readonly commandArgsSignal = model<NoInfer<TArgs> | null>(null, { alias: 'commandArgs' });
    public readonly commandOptionsSignal = model<CommandOptions<NoInfer<TArgs>> | undefined | null>(null, {
        alias: 'commandOptions',
    });

    public readonly commandSignal = createCommandFromInputSignal(this.commandInputSignal, this.commandOptionsSignal);

    @HostListener('click')
    protected onClick() {
        trace('puiClickCommand', this._elementRef.nativeElement, 'Clicking', this.commandSignal());
        this.commandSignal()?.trigger(this.commandArgsSignal() as TArgs);
    }

    @HostListener('keyup.enter')
    @HostListener('keyup.space')
    protected onKeyupEnter() {
        if (!this._elementRef.nativeElement.matches('button, a')) {
            // If it is not a button, manually trigger the command
            this.commandSignal()?.trigger(this.commandArgsSignal() as TArgs);
        }
    }
}
