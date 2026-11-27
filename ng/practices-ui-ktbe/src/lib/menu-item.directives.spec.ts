import '@angular/compiler';
import { Component, signal, Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { provideRouter, Router, RouterLink, RouterOutlet } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PuibeFooterMenuItemDirective } from './footer/footer-menu-item.directive';
import { PuibeHeaderMainMenuItemDirective } from './header/header-main-menu-item.directive';
import { PuibeHeaderServiceMenuItemDirective } from './header/header-service-menu-item.directive';

const activeClassName = 'after:border-red';

@Component({ template: '' })
class EmptyComponent {}

const directives: { name: string; selector: string; directive: Type<unknown> }[] = [
    {
        name: 'PuibeHeaderMainMenuItemDirective',
        selector: 'puibeHeaderMainMenuItem',
        directive: PuibeHeaderMainMenuItemDirective,
    },
    {
        name: 'PuibeHeaderServiceMenuItemDirective',
        selector: 'puibeHeaderServiceMenuItem',
        directive: PuibeHeaderServiceMenuItemDirective,
    },
    { name: 'PuibeFooterMenuItemDirective', selector: 'puibeFooterMenuItem', directive: PuibeFooterMenuItemDirective },
];

describe.each(directives)('$name active state', ({ selector, directive }) => {
    beforeAll(() => {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
    });

    let fixture: ComponentFixture<{ link: WritableSignal<string | null> }>;

    async function renderAt(url: string, attributes: string, { withRouterLink = true } = {}) {
        @Component({
            imports: withRouterLink ? [directive, RouterLink] : [directive],
            template: `<div><button type="button" ${selector} ${attributes}>Item</button></div>`,
        })
        class HostComponent {
            readonly id = 'probe';
            readonly link = signal<string | null>(null);
        }

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                provideRouter([
                    { path: 'probe', component: EmptyComponent },
                    { path: 'other', component: EmptyComponent },
                ]),
            ],
        });

        fixture = TestBed.createComponent(HostComponent);
        await TestBed.inject(Router).navigateByUrl(url);
        fixture.detectChanges();
        await fixture.whenStable();

        return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    }

    /** Updates the bound link; the active state must be updated synchronously within change detection. */
    function setLink(link: string | null) {
        fixture.componentInstance.link.set(link);
        fixture.detectChanges();
    }

    /** Renders the item inside the component of the `admin` route, so relative links resolve against `/admin`. */
    async function renderNestedAt(url: string, attributes: string, { withRouterLink = true } = {}) {
        @Component({
            imports: withRouterLink ? [directive, RouterLink, RouterOutlet] : [directive, RouterOutlet],
            template: `<div><button type="button" ${selector} ${attributes}>Item</button></div>
                <router-outlet />`,
        })
        class AdminComponent {}

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [
                provideRouter([
                    {
                        path: 'admin',
                        component: AdminComponent,
                        children: [
                            { path: '', component: EmptyComponent },
                            { path: 'users', component: EmptyComponent },
                        ],
                    },
                    { path: 'users', component: EmptyComponent },
                ]),
            ],
        });

        const harness = await RouterTestingHarness.create(url);
        await harness.fixture.whenStable();

        return harness.routeNativeElement.querySelector('button') as HTMLButtonElement;
    }

    it('is active when the routerLink attribute matches the current route', async () => {
        const button = await renderAt('/probe', 'routerLink="probe"');

        expect(button.classList).toContain(activeClassName);
    });

    it('is not active when the routerLink attribute does not match the current route', async () => {
        const button = await renderAt('/other', 'routerLink="probe"');

        expect(button.classList).not.toContain(activeClassName);
    });

    it('is active when the routerLink is bound to a commands array', async () => {
        const button = await renderAt('/probe', `[routerLink]="['/', id]"`);

        expect(button.classList).toContain(activeClassName);
    });

    it('is not active when the routerLink commands array does not match the current route', async () => {
        const button = await renderAt('/other', `[routerLink]="['/', id]"`);

        expect(button.classList).not.toContain(activeClassName);
    });

    it.each([`[routerLink]="['users']"`, 'routerLink="users"'])(
        'resolves the relative link %s against the route of the item',
        async (attributes) => {
            const button = await renderNestedAt('/admin/users', attributes);

            expect(button.classList).toContain(activeClassName);
        }
    );

    it('is not active when the relative link points to a different route', async () => {
        const button = await renderNestedAt('/admin/users', `[routerLink]="['../users']"`);

        expect(button.classList).not.toContain(activeClassName);
    });

    it.each([
        ['navLink=""', true],
        ['routerLink=""', false],
        [`[routerLink]="[]"`, false],
    ])('treats the empty link %s as no link (with RouterLink: %s)', async (attributes, withRouterLink) => {
        const button = await renderNestedAt('/admin', attributes, { withRouterLink });

        expect(button.classList).not.toContain(activeClassName);
    });

    it('treats routerLink="" with RouterLink as link to the route of the item, like RouterLink does', async () => {
        const button = await renderNestedAt('/admin', 'routerLink=""');

        expect(button.classList).toContain(activeClassName);
    });

    it('updates the active state when only the query params of RouterLink change', async () => {
        const button = await renderAt(
            '/probe?tab=a',
            `routerLink="probe" [queryParams]="{ tab: link() }" [routerLinkActiveOptions]="{ exact: true }"`
        );
        expect(button.classList).not.toContain(activeClassName);

        setLink('a');
        expect(button.classList).toContain(activeClassName);

        setLink('b');
        expect(button.classList).not.toContain(activeClassName);
    });

    it('parses a navLink as absolute URL, as before', async () => {
        const button = await renderNestedAt('/admin/users', 'navLink="admin/users"');

        expect(button.classList).toContain(activeClassName);
    });

    it('supports query params in a navLink', async () => {
        const button = await renderAt(
            '/probe?tab=a',
            `navLink="/probe?tab=a" [navLinkActiveOptions]="{ exact: true }"`
        );

        expect(button.classList).toContain(activeClassName);
    });

    it('prefers the navLink over the routerLink', async () => {
        const button = await renderAt('/probe', 'routerLink="other" navLink="probe"');

        expect(button.classList).toContain(activeClassName);
    });

    it('falls back to the routerLink when the navLink is not set', async () => {
        const button = await renderAt('/probe', 'routerLink="probe" [navLink]="undefined"');

        expect(button.classList).toContain(activeClassName);
    });

    it('uses the URL of RouterLink, including its query params', async () => {
        const button = await renderAt(
            '/probe?tab=a',
            `routerLink="probe" [queryParams]="{ tab: 'a' }" [routerLinkActiveOptions]="{ exact: true }"`
        );

        expect(button.classList).toContain(activeClassName);
    });

    it('parses a routerLink without RouterLink as absolute URL', async () => {
        const button = await renderNestedAt('/admin/users', 'routerLink="admin/users"', { withRouterLink: false });

        expect(button.classList).toContain(activeClassName);
    });

    it('updates the active state when the bound routerLink changes', async () => {
        const button = await renderAt('/probe', '[routerLink]="link()"');
        expect(button.classList).not.toContain(activeClassName);

        setLink('probe');
        expect(button.classList).toContain(activeClassName);

        setLink('other');
        expect(button.classList).not.toContain(activeClassName);
    });

    it('is active when the navLink attribute matches the current route', async () => {
        const button = await renderAt('/probe', 'navLink="probe"');

        expect(button.classList).toContain(activeClassName);
    });

    it('is active when both routerLink and navLink are set', async () => {
        const button = await renderAt('/probe', 'routerLink="probe" navLink="probe"');

        expect(button.classList).toContain(activeClassName);
    });

    it('respects routerLinkActiveOptions', async () => {
        const button = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' }"`
        );

        expect(button.classList).not.toContain(activeClassName);
    });

    it('respects navLinkActiveOptions', async () => {
        const button = await renderAt(
            '/probe?x=1',
            `navLink="probe" [navLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' }"`
        );

        expect(button.classList).not.toContain(activeClassName);
    });

    it.each([
        ['/probe', true],
        ['/probe?x=1', false],
    ])('supports RouterLinkActive-style { exact: true } options on %s', async (url, active) => {
        const button = await renderAt(url, `routerLink="probe" [routerLinkActiveOptions]="{ exact: true }"`);

        expect(button.classList.contains(activeClassName)).toBe(active);
    });

    it('fills missing options with subset matching', async () => {
        const button = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ paths: 'exact' }"`
        );

        expect(button.classList).toContain(activeClassName);
    });

    it('interprets mixed active options like RouterLinkActive: match options win over exact', async () => {
        const button = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ exact: true, paths: 'subset' }"`
        );

        expect(button.classList).toContain(activeClassName);
    });

    it('ignores undefined values in the active options', async () => {
        const button = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ paths: 'exact', queryParams: undefined }"`
        );

        expect(button.classList).toContain(activeClassName);
    });

    it('prefers navLinkActiveOptions and falls back to routerLinkActiveOptions', async () => {
        const exact = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ exact: true }" [navLinkActiveOptions]="undefined"`
        );
        expect(exact.classList).not.toContain(activeClassName);

        TestBed.resetTestingModule();
        const subset = await renderAt(
            '/probe?x=1',
            `routerLink="probe" [routerLinkActiveOptions]="{ exact: true }" [navLinkActiveOptions]="{ exact: false }"`
        );
        expect(subset.classList).toContain(activeClassName);
    });

    if (directive === PuibeFooterMenuItemDirective) {
        it('styles a button with a routerLink as link', async () => {
            const button = await renderAt('/other', 'routerLink="probe"');

            expect(button.classList).toContain('hover:text-black');
        });

        it('styles a button as link once its link is set', async () => {
            const button = await renderAt('/other', '[navLink]="link()"');
            expect(button.classList).not.toContain('hover:text-black');

            setLink('probe');
            expect(button.classList).toContain('hover:text-black');
        });
    }
});
