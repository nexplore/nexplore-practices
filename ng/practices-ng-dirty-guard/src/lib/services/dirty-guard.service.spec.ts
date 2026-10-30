import { MOCK_PLATFORM_LOCATION_CONFIG, MockPlatformLocation } from '@angular/common/testing';
import { PlatformLocation } from '@angular/common';
import { ApplicationRef, Component, inject, InjectionToken, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    NavigationEnd,
    provideRouter,
    Router,
    RouterOutlet,
    withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { filter, firstValueFrom, take } from 'rxjs';
import { PuiGlobalDirtyGuardDirective } from '../directives/dirty-guard.directive';
import { provideDirtyGuard } from '../dirty-guard.providers';
import { PuiDirtyGuardHandler } from '../types';

describe('PuiDirtyGuardService initial navigation', () => {
    const applications: ApplicationRef[] = [];
    const hosts: HTMLElement[] = [];

    afterEach(() => {
        applications.splice(0).forEach((app) => app.destroy());
        hosts.splice(0).forEach((host) => host.remove());
    });

    it.each([
        { useBlockingInitialNavigation: true, userConfirmsDiscardingChanges: false },
        { useBlockingInitialNavigation: true, userConfirmsDiscardingChanges: true },
        { useBlockingInitialNavigation: false, userConfirmsDiscardingChanges: false },
        { useBlockingInitialNavigation: false, userConfirmsDiscardingChanges: true },
    ])(
        'protects the initial route (blocking=$useBlockingInitialNavigation, discard confirmed=$userConfirmsDiscardingChanges)',
        async ({ useBlockingInitialNavigation, userConfirmsDiscardingChanges }) => {
            // Arrange
            const { router, defaultDialogHandler } = await bootstrapApp({
                useBlockingInitialNavigation,
                userConfirmsDiscardingChanges,
            });

            // Act
            const navigated = await router.navigateByUrl('/test/b');

            // Assert
            expect(defaultDialogHandler).toHaveBeenCalledTimes(1);
            expect(navigated).toBe(userConfirmsDiscardingChanges);
            expect(router.url).toBe(userConfirmsDiscardingChanges ? '/test/b' : '/test/a');
        }
    );

    it('protects the current route when the guard is created after initial navigation', async () => {
        // Arrange
        const { app, router, defaultDialogHandler } = await bootstrapApp({ showGuardedOutletInitially: false });
        const component = app.components[0].instance as TestAppComponent;

        // Act
        component.showGuardedOutlet.set(true);
        app.tick();
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(defaultDialogHandler).toHaveBeenCalledTimes(1);
        expect(navigated).toBe(false);
        expect(router.url).toBe('/test/a');
    });

    it('allows leaving a pristine initial route without confirmation', async () => {
        // Arrange
        const { router, defaultDialogHandler } = await bootstrapApp({ pageHasUnsavedChanges: false });

        // Act
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(defaultDialogHandler).not.toHaveBeenCalled();
        expect(navigated).toBe(true);
    });

    it('uses the configured dialog handler when the guard is created after initial navigation', async () => {
        // Arrange
        const { app, router, defaultDialogHandler, customOutletDialogHandler } = await bootstrapApp({
            showGuardedOutletInitially: false,
            useCustomOutletDialogHandler: true,
        });
        const component = app.components[0].instance as TestAppComponent;

        // Act
        component.showGuardedOutlet.set(true);
        app.tick();
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(customOutletDialogHandler).toHaveBeenCalledTimes(1);
        expect(defaultDialogHandler).not.toHaveBeenCalled();
        expect(navigated).toBe(false);
    });

    it.each([false, true])(
        'protects a lazy outlet with non-blocking startup (custom outlet handler=%s)',
        async (useCustomOutletDialogHandler) => {
            // Arrange
            const { app, router, defaultDialogHandler, customOutletDialogHandler } = await bootstrapApp({
                useBlockingInitialNavigation: false,
                showGuardedOutletInitially: false,
                useCustomOutletDialogHandler,
            });

            // Act
            const entered = await router.navigateByUrl('/test/lazy/a');
            app.tick();
            const navigated = await router.navigateByUrl('/test/lazy/b');

            // Assert
            expect(entered).toBe(true);
            expect(
                useCustomOutletDialogHandler ? customOutletDialogHandler : defaultDialogHandler
            ).toHaveBeenCalledTimes(1);
            expect(
                useCustomOutletDialogHandler ? defaultDialogHandler : customOutletDialogHandler
            ).not.toHaveBeenCalled();
            expect(navigated).toBe(false);
            expect(router.url).toBe('/test/lazy/a');
        }
    );

    it('protects newly visited routes after the first successful navigation', async () => {
        // Arrange
        const { app, router, defaultDialogHandler } = await bootstrapApp({ pageHasUnsavedChanges: false });

        // Act
        const entered = await router.navigateByUrl('/test/c');
        app.tick();
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(entered).toBe(true);
        expect(defaultDialogHandler).toHaveBeenCalledTimes(1);
        expect(navigated).toBe(false);
        expect(router.url).toBe('/test/c');
    });

    it('protects the initial route after a guard redirect during bootstrap', async () => {
        // Arrange
        const { router, defaultDialogHandler } = await bootstrapApp({ initialPath: '/test/redirect' });

        // Act
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(defaultDialogHandler).toHaveBeenCalledTimes(1);
        expect(navigated).toBe(false);
        expect(router.url).toBe('/test/a');
    });

    it('still protects the current route after another guard cancels a navigation', async () => {
        // Arrange
        const { router, defaultDialogHandler } = await bootstrapApp();
        defaultDialogHandler.mockReturnValue(true);

        // Act
        const blockedNavigation = await router.navigateByUrl('/test/blocked');
        defaultDialogHandler.mockReturnValue(false);
        const navigated = await router.navigateByUrl('/test/b');

        // Assert
        expect(blockedNavigation).toBe(false);
        expect(navigated).toBe(false);
        expect(defaultDialogHandler).toHaveBeenCalledTimes(2);
        expect(router.url).toBe('/test/a');
    });

    async function bootstrapApp({
        useBlockingInitialNavigation = true,
        showGuardedOutletInitially = true,
        pageHasUnsavedChanges = true,
        userConfirmsDiscardingChanges = false,
        useCustomOutletDialogHandler = false,
        initialPath = '/test/a',
    } = {}) {
        const host = document.createElement('pui-test-dirty-guard-app');
        hosts.push(host);
        document.body.appendChild(host);
        const defaultDialogHandler = jest.fn(() => userConfirmsDiscardingChanges);
        const customOutletDialogHandler = jest.fn(() => userConfirmsDiscardingChanges);
        const app = await bootstrapApplication(TestAppComponent, {
            providers: [
                { provide: PlatformLocation, useClass: MockPlatformLocation },
                {
                    provide: MOCK_PLATFORM_LOCATION_CONFIG,
                    useValue: { startUrl: `http://localhost${initialPath}` },
                },
                { provide: SHOW_GUARDED_OUTLET_INITIALLY, useValue: showGuardedOutletInitially },
                { provide: PAGE_HAS_UNSAVED_CHANGES, useValue: pageHasUnsavedChanges },
                {
                    provide: OUTLET_DIALOG_HANDLER,
                    useValue: useCustomOutletDialogHandler ? customOutletDialogHandler : defaultDialogHandler,
                },
                provideRouter(
                    [
                        {
                            path: 'test',
                            children: [
                                { path: 'a', component: TestDirtyPageComponent },
                                { path: 'b', component: TestOtherPageComponent },
                                {
                                    path: 'c',
                                    component: TestDirtyPageComponent,
                                    providers: [{ provide: PAGE_HAS_UNSAVED_CHANGES, useValue: true }],
                                },
                                {
                                    path: 'redirect',
                                    component: TestOtherPageComponent,
                                    canActivate: [() => inject(Router).parseUrl('/test/a')],
                                },
                                {
                                    path: 'blocked',
                                    component: TestOtherPageComponent,
                                    canActivate: [() => false],
                                },
                                {
                                    path: 'lazy',
                                    loadComponent: () => Promise.resolve(TestLazyGuardShellComponent),
                                    children: [
                                        { path: 'a', component: TestDirtyPageComponent },
                                        { path: 'b', component: TestOtherPageComponent },
                                    ],
                                },
                            ],
                        },
                    ],
                    ...(useBlockingInitialNavigation ? [withEnabledBlockingInitialNavigation()] : [])
                ),
                provideDirtyGuard({ evaluateDiscardChangesAsyncHandler: defaultDialogHandler }),
            ],
        });
        applications.push(app);
        const router = app.injector.get(Router);
        if (!router.navigated) {
            await firstValueFrom(
                router.events.pipe(
                    filter((event) => event instanceof NavigationEnd),
                    take(1)
                )
            );
        }
        app.tick();
        return { app, router, defaultDialogHandler, customOutletDialogHandler };
    }
});

const SHOW_GUARDED_OUTLET_INITIALLY = new InjectionToken<boolean>('SHOW_GUARDED_OUTLET_INITIALLY');
const PAGE_HAS_UNSAVED_CHANGES = new InjectionToken<boolean>('PAGE_HAS_UNSAVED_CHANGES');
const OUTLET_DIALOG_HANDLER = new InjectionToken<PuiDirtyGuardHandler>('OUTLET_DIALOG_HANDLER');

@Component({
    selector: 'pui-test-dirty-page',
    standalone: true,
    template: 'Unsaved form',
})
class TestDirtyPageComponent {
    public readonly pageHasUnsavedChanges = inject(PAGE_HAS_UNSAVED_CHANGES);

    public canDeactivate(): boolean {
        return !this.pageHasUnsavedChanges;
    }
}

@Component({ standalone: true, template: 'Other page' })
class TestOtherPageComponent {}

@Component({
    standalone: true,
    imports: [RouterOutlet, PuiGlobalDirtyGuardDirective],
    template: '<router-outlet puiGlobalDirtyGuard [dirtyGuardHandler]="outletDialogHandler" />',
})
class TestLazyGuardShellComponent {
    public readonly outletDialogHandler = inject(OUTLET_DIALOG_HANDLER);
}

@Component({
    selector: 'pui-test-dirty-guard-app',
    standalone: true,
    imports: [RouterOutlet, PuiGlobalDirtyGuardDirective],
    template: `
        @if (showGuardedOutlet()) {
        <router-outlet puiGlobalDirtyGuard [dirtyGuardHandler]="outletDialogHandler" />
        } @else {
        <router-outlet />
        }
    `,
})
class TestAppComponent {
    public readonly showGuardedOutlet = signal(inject(SHOW_GUARDED_OUTLET_INITIALLY));
    public readonly outletDialogHandler = inject(OUTLET_DIALOG_HANDLER);
}
