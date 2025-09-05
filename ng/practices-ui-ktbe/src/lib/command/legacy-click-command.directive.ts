import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import {
    DestroyService,
    ILegacyCommand,
    LegacyCommand,
    LegacyCommandBase,
    LegacyCommandOptions,
    StatusService,
} from '@nexplore/practices-ui';
import { BehaviorSubject, combineLatest, shareReplay, Subscription, takeUntil, tap } from 'rxjs';

import { setHostAttr } from '../util/utils';

/**
 * @internal @deprecated Use `PuiClickCommandDirective` instead
 */
@Directive({
    selector: '[puibeLegacyClickCommand]',
    standalone: true,
    providers: [DestroyService],
})
export class PuibeLegacyClickCommandDirective<TArgs, TResult> implements OnInit {
    @HostListener('click')
    onClick() {
        this.command?.trigger(this.commandArgs);
    }

    @HostListener('keyup.enter')
    @HostListener('keyup.space')
    onKeyupEnter() {
        if (!this._elementRef.nativeElement.matches('a, button')) {
            // If it is not a button, manually trigger the command
            this.command?.trigger(this.commandArgs);
        }
    }

    private _legacyCommandSubject = new BehaviorSubject<LegacyCommandBase<TArgs, TResult>>(null);
    private _legacyCommandOptions: LegacyCommandOptions<TArgs>;
    private _currentCommandSubscription: Subscription;

    readonly destroy$ = inject(DestroyService);
    private _status = inject(StatusService);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    set command(v: ILegacyCommand<TArgs, TResult>) {
        const newCommmand = LegacyCommand.from(v, this.commandOptions);
        this._legacyCommandSubject.next(newCommmand);
    }

    get command(): LegacyCommandBase<TArgs, TResult> {
        return this._legacyCommandSubject.value;
    }

    /**
     * @deprecated
     *
     * Use `puiClickCommand` instead (from `@nexplore/practices-ng-commands`)
     **/
    @Input()
    set puibeClickCommand(v: '' | ILegacyCommand<TArgs, TResult>) {
        if (v !== '') {
            // This check for empty string is needed to support the existing syntax that goes: `<element puibeClickCommand [clickCommand]="command">`
            this.command = v;
        }
    }

    /**
     * @deprecated
     *
     * Use `puiClickCommand` instead (from `@nexplore/practices-ng-commands`), or directly `clickCommand` on [puibeButton] or [puibeTeaser].
     **/
    @Input()
    set clickCommand(v: '' | ILegacyCommand<TArgs, TResult>) {
        if (v !== '') {
            // This check for empty string is needed to support the existing syntax that goes: `<element puibeClickCommand [clickCommand]="command">`
            this.command = v;
        }
    }

    readonly command$ = this._legacyCommandSubject.pipe(
        tap((c) => this._registerCommand(c)), // Make sure the command is first registered in the directive
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    @Input() commandArgs: TArgs;

    /**
     *
     *
     * Default options for the passed in command */
    @Input() set commandOptions(value: LegacyCommandOptions<TArgs>) {
        this._legacyCommandOptions = value;

        if (this.command) {
            this._legacyCommandSubject.next(LegacyCommand.from(this.command, this.commandOptions));
        }
    }

    get commandOptions() {
        return this._legacyCommandOptions;
    }

    private _registerCommand = (command: LegacyCommandBase<TArgs, TResult>) => {
        if (this._currentCommandSubscription) {
            this._currentCommandSubscription.unsubscribe();
        }

        if (command) {
            this._currentCommandSubscription = new Subscription();

            if (this._status) {
                this._currentCommandSubscription.add(this._status.subscribeToCommand(command));
            }

            this.addSubscription(
                combineLatest([command.canExecute$, command.busy$])
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(([canExecute, busy]) => {
                        const disabled = busy || !canExecute;
                        setHostAttr('data-override-disabled', disabled, this._elementRef);
                        setHostAttr('disabled', disabled, this._elementRef);
                        setHostAttr('aria-disabled', disabled, this._elementRef);
                    })
            );
        }
    };

    ngOnInit(): void {
        this.command$.pipe(takeUntil(this.destroy$)).subscribe();
    }

    addSubscription(sub: Subscription) {
        this._currentCommandSubscription?.add(sub);
    }
}
