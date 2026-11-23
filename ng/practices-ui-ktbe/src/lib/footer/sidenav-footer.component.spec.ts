import '@angular/compiler';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { PuibeSidenavFooterComponent } from './sidenav-footer.component';

describe('PuibeSidenavFooterComponent', () => {
    let host: HTMLElement;
    let openSpy: jest.SpyInstance;

    beforeEach(() => {
        host = document.createElement('div');
        document.body.appendChild(host);

        const injector = Injector.create({ providers: [{ provide: ElementRef, useValue: new ElementRef(host) }] });
        const component = runInInjectionContext(injector, () => new PuibeSidenavFooterComponent());
        // Mirrors the @HostListener('click') binding.
        host.addEventListener('click', (event) => component.onItemClick(event));

        openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
        host.remove();
        openSpy.mockRestore();
    });

    function addLink(attributes: Record<string, string> = {}, content?: HTMLElement): HTMLAnchorElement {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', '#target');
        Object.entries(attributes).forEach(([name, value]) => anchor.setAttribute(name, value));
        if (content) {
            anchor.appendChild(content);
        }
        host.appendChild(anchor);
        return anchor;
    }

    function click(element: HTMLElement, init: MouseEventInit = {}) {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
    }

    it('opens a plain link in the same window', () => {
        const anchor = addLink();

        click(anchor);

        expect(openSpy).toHaveBeenCalledWith(anchor.href, '_self');
    });

    it('opens the link when the click lands on content inside it', () => {
        const label = document.createElement('span');
        const anchor = addLink({}, label);

        click(label);

        expect(openSpy).toHaveBeenCalledWith(anchor.href, '_self');
    });

    it('ignores links that are already handled, e.g. by RouterLink', () => {
        const anchor = addLink();
        anchor.addEventListener('click', (event) => event.preventDefault());

        click(anchor);

        expect(openSpy).not.toHaveBeenCalled();
    });

    it('leaves links with another target to the browser', () => {
        const anchor = addLink({ target: '_blank' });

        click(anchor);

        expect(openSpy).not.toHaveBeenCalled();
    });

    it('leaves modified clicks to the browser', () => {
        const anchor = addLink();

        click(anchor, { ctrlKey: true });

        expect(openSpy).not.toHaveBeenCalled();
    });

    it('ignores clicks outside of links', () => {
        const text = document.createElement('span');
        host.appendChild(text);

        click(text);

        expect(openSpy).not.toHaveBeenCalled();
    });
});
