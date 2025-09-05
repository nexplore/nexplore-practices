import { DialogConfig } from '@angular/cdk/dialog';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { outputToObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PuibeSideOverlayPanelComponent } from './side-overlay-panel.component';

export type PuibeSideOverlayPanelOptions = {
    title?: string;
    titleKey?: string;
    content?: ComponentType<unknown>;
    dialogConfig?: DialogConfig;
};

@Injectable({ providedIn: 'root' })
export class PuibeSideOverlayPanelService {
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _translateService = inject(TranslateService);
    private readonly _overlay = inject(Overlay);
    private readonly _router = inject(Router);

    private _overlayRef: OverlayRef | null = null;
    private _panelInstance: PuibeSideOverlayPanelComponent | null = null;
    private _subscriptions: Subscription;

    /**
     * Indicates whether a side overlay panel is currently open.
     *
     * Returns `true` if an `OverlayRef` is active, otherwise `false`.
     * Useful for conditional logic, guards, or template binding.
     *
     * Usage example:
     * ```ts
     * if (this.sideOverlayService.isOpen) {
     *   // Maybe prevent reopening
     * }
     * ```
     */
    public get isOpen(): boolean {
        return !!this._overlayRef;
    }

    /**
     * Opens a side overlay panel with customizable content, configuration, and localization.
     *
     * This method dynamically creates and displays a side panel anchored to the right of the screen.
     * It is safe to call multiple times: if a panel is already open, it will close the previous one first.
     *
     * ---
     * ✅ Features:
     * - Dynamic content loading via `ComponentPortal`
     * - Optional title translation
     * - Backdrop and Escape key support for closing
     * - Reactive closing via panel component's `closed` event
     * - Scroll reposition strategy to maintain positioning
     *
     * ---
     * 📦 Parameters:
     * @param options - An object containing:
     * - `title`: The panel header text
     * - `content`: (Optional) Angular component to render inside the panel
     * - `dialogConfig`: (Optional) Custom `DialogConfig` values to override default layout
     * - `localize`: (Optional) Whether to pass the `title` through `TranslateService`. default: true
     *
     * ---
     * 🔁 Behavior:
     * - Destroys and replaces any existing overlay
     * - Attaches `PuibeSideOverlayPanelComponent` via portal
     * - Loads custom content if provided
     * - Listens for:
     *   - Escape key → closes panel
     *   - Backdrop click → closes panel
     *   - `closed` output → disposes overlay and cleans up
     *
     * ---
     * 🧠 Notes:
     * - `title` is set via a `Signal<string>` on the panel component.
     * - The `overlayRef` is reused for full lifecycle control.
     * - Cleanup is managed with `takeUntilDestroyed` and `DestroyRef`.
     *
     * ---
     * 💡 Example:
     * ```ts
     * this.sideOverlayService.open({
     *   title: 'Settings',
     *   content: SettingsComponent,
     *   localize: false
     * });
     * ```
     *
     * @returns The active `OverlayRef` instance for additional control if needed.
     */
    public open(options: PuibeSideOverlayPanelOptions): OverlayRef {
        if (this._overlayRef || this._panelInstance) {
            this._close();
        }

        const { title, titleKey, content, dialogConfig } = options;

        this._overlayRef = this._overlay.create(this._createOverlayConfig(dialogConfig));

        const panelPortal = new ComponentPortal(PuibeSideOverlayPanelComponent);
        const panelRef = this._overlayRef.attach(panelPortal);
        this._panelInstance = panelRef.instance;

        if (title) {
            this._panelInstance.titleSignal.set(title);
        }

        if (titleKey) {
            this._panelInstance.titleSignal.set(this._translateService.instant(titleKey));
        }

        if (content) {
            this._panelInstance.loadContent(content);
        }

        this._subscriptions = new Subscription();

        this._subscriptions.add(
            this._overlayRef
                .keydownEvents()
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe((event: KeyboardEvent) => {
                    if (event.key === 'Escape') {
                        this._panelInstance.close();
                    }
                })
        );

        this._subscriptions.add(
            this._overlayRef
                .backdropClick()
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(() => this._panelInstance.close())
        );

        this._subscriptions.add(
            outputToObservable(this._panelInstance.closed)
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(() => this._close())
        );

        return this._overlayRef;
    }

    /**
     * Closes the currently displayed overlay panel by calling the internal panel component’s `close()` method.
     *
     * This method does **not** directly dispose of the overlay or reset internal references. Instead, it triggers
     * the close lifecycle of the panel component, which typically results in emitting the `closed` event.
     * That event then leads to a full teardown via the `close()` method.
     *
     * This is useful when you want to close the panel in a way that respects animations or emits lifecycle events.
     *
     * Usage example:
     * ```ts
     * this.sideOverlayService.closeOpenPanel();
     * ```
     *
     * > Will safely do nothing if no panel is currently open.
     */
    public closeOpenPanel() {
        this._panelInstance?.close();
    }

    private _close() {
        if (this._subscriptions) {
            this._subscriptions.unsubscribe();
            this._subscriptions = null;
        }

        if (!this._overlayRef) return;
        this._overlayRef?.dispose();
        this._overlayRef = null;
        this._panelInstance = null;
    }

    private _createOverlayConfig(dialogConfig?: DialogConfig): OverlayConfig {
        return {
            hasBackdrop: true,
            backdropClass: 'bg-transparent',
            positionStrategy: this._overlay.position().global().right('0').top('0'),
            height: '100vh',
            width: '40%',
            maxWidth: '600px',
            minWidth: '500px',
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            disposeOnNavigation: true,
            ...dialogConfig,
        };
    }
}

export const SIDE_OVERLAY_PANEL_PROVIDERS = [PuibeSideOverlayPanelService];
