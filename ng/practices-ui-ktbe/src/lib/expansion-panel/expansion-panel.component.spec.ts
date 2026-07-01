import '@angular/compiler';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { PuibeExpansionPanelComponent } from './expansion-panel.component';

describe('PuibeExpansionPanelComponent', () => {
    let component: PuibeExpansionPanelComponent;
    let markForCheck: jest.Mock;

    beforeEach(() => {
        markForCheck = jest.fn();
        component = new PuibeExpansionPanelComponent(new ElementRef(document.createElement('div')), {
            markForCheck,
        } as unknown as ChangeDetectorRef);
    });

    it('moves the heading after into the action area and reserves its inline width', () => {
        const { heading, headingAfterInlineHost, headingAfterActionHost, headingAfterWrapper, setHeadingHeight } =
            setupHeadingAfterLayout();

        setHeadingHeight(48);
        setHeadingAfterWrapperWidth(headingAfterWrapper, 42);

        component.headingText = { nativeElement: heading } as ElementRef<HTMLElement>;
        component.headingAfterWrapper = { nativeElement: headingAfterWrapper } as ElementRef<HTMLElement>;
        component.headingAfterInlineHost = { nativeElement: headingAfterInlineHost } as ElementRef<HTMLElement>;
        component.headingAfterActionHost = { nativeElement: headingAfterActionHost } as ElementRef<HTMLElement>;

        jest.spyOn(window, 'getComputedStyle').mockReturnValue({ lineHeight: '24px' } as CSSStyleDeclaration);

        component['updateHeadingAfterPosition']();

        expect(headingAfterActionHost.contains(headingAfterWrapper)).toBe(true);
        expect(headingAfterInlineHost.style.minWidth).toBe('42px');
        expect(markForCheck).toHaveBeenCalledTimes(1);
    });

    it('moves the heading after back inline and clears the reserved width when the heading no longer wraps', () => {
        const { heading, headingAfterInlineHost, headingAfterActionHost, headingAfterWrapper, setHeadingHeight } =
            setupHeadingAfterLayout();

        setHeadingHeight(48);
        setHeadingAfterWrapperWidth(headingAfterWrapper, 42);

        component.headingText = { nativeElement: heading } as ElementRef<HTMLElement>;
        component.headingAfterWrapper = { nativeElement: headingAfterWrapper } as ElementRef<HTMLElement>;
        component.headingAfterInlineHost = { nativeElement: headingAfterInlineHost } as ElementRef<HTMLElement>;
        component.headingAfterActionHost = { nativeElement: headingAfterActionHost } as ElementRef<HTMLElement>;

        jest.spyOn(window, 'getComputedStyle').mockReturnValue({ lineHeight: '24px' } as CSSStyleDeclaration);

        component['updateHeadingAfterPosition']();
        setHeadingHeight(24);

        component['updateHeadingAfterPosition']();

        expect(headingAfterInlineHost.contains(headingAfterWrapper)).toBe(true);
        expect(headingAfterInlineHost.style.minWidth).toBe('');
        expect(markForCheck).toHaveBeenCalledTimes(2);
    });

    it('updates the reserved inline width when the content changes while still wrapped', () => {
        const { heading, headingAfterInlineHost, headingAfterActionHost, headingAfterWrapper, setHeadingHeight } =
            setupHeadingAfterLayout();

        setHeadingHeight(48);
        setHeadingAfterWrapperWidth(headingAfterWrapper, 42);

        component.headingText = { nativeElement: heading } as ElementRef<HTMLElement>;
        component.headingAfterWrapper = { nativeElement: headingAfterWrapper } as ElementRef<HTMLElement>;
        component.headingAfterInlineHost = { nativeElement: headingAfterInlineHost } as ElementRef<HTMLElement>;
        component.headingAfterActionHost = { nativeElement: headingAfterActionHost } as ElementRef<HTMLElement>;

        jest.spyOn(window, 'getComputedStyle').mockReturnValue({ lineHeight: '24px' } as CSSStyleDeclaration);

        component['updateHeadingAfterPosition']();
        setHeadingAfterWrapperWidth(headingAfterWrapper, 64);

        component['updateHeadingAfterPosition']();

        expect(headingAfterActionHost.contains(headingAfterWrapper)).toBe(true);
        expect(headingAfterInlineHost.style.minWidth).toBe('64px');
        expect(markForCheck).toHaveBeenCalledTimes(1);
    });
});

function setupHeadingAfterLayout() {
    let headingHeight = 24;
    const heading = document.createElement('p');
    Object.defineProperty(heading, 'clientHeight', {
        configurable: true,
        get: () => headingHeight,
    });

    const headingAfterInlineHost = document.createElement('span');
    const headingAfterActionHost = document.createElement('span');
    const headingAfterWrapper = document.createElement('span');

    headingAfterInlineHost.appendChild(headingAfterWrapper);

    return {
        heading,
        headingAfterInlineHost,
        headingAfterActionHost,
        headingAfterWrapper,
        setHeadingHeight(height: number) {
            headingHeight = height;
        },
    };
}

function setHeadingAfterWrapperWidth(element: HTMLElement, width: number) {
    Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ width }),
    });
}
