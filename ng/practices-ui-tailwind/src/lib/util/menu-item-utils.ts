import { ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function wrapHostWithListItemElement(
    elementRef: ElementRef,
    renderer: Renderer2,
    ...listItemClassList: string[]
): void {
    // Timeout was needed, as in some cases the element was not yet connected to the DOM (inside ng-template)
    setTimeout(() => {
        // TODO: Wrapping is a bad practice, and can cause many problems with angular,
        // but needed here to provide good semantics for all menus/navigations
        const parentNode = renderer.parentNode(elementRef.nativeElement) as Element;
        if (parentNode) {
            const parentNodeIsAlreadyListItem = parentNode.matches('li');
            const li: HTMLLIElement = parentNodeIsAlreadyListItem ? parentNode : renderer.createElement('li');
            li.classList.add(...listItemClassList);
            if (!parentNodeIsAlreadyListItem) {
                renderer.appendChild(parentNode, li);
                renderer.appendChild(li, elementRef.nativeElement);
            }
        } else {
            console.error('wrapHostWithListItemElement: No parent found', elementRef.nativeElement);
        }
    });
}

export function createScreenReaderTextElement(elementRef: ElementRef, renderer: Renderer2): HTMLSpanElement {
    const screenReaderSpanElement = renderer.createElement('span');
    screenReaderSpanElement.classList.add('sr-only');
    renderer.appendChild(elementRef.nativeElement, screenReaderSpanElement);

    return screenReaderSpanElement;
}

export function removeParentElementFromDom(elementRef: ElementRef, renderer: Renderer2) {
    const parentNode = renderer.parentNode(elementRef.nativeElement) as Element;
    if (parentNode) {
        const parentNodeIsListItem = parentNode.matches('li');
        if (parentNodeIsListItem) {
            parentNode.remove();
        }
    }
}

export function setScreenReaderText(
    isActive: boolean,
    screenReaderTextElement: HTMLSpanElement,
    translate: TranslateService
): void {
    screenReaderTextElement.innerText = isActive ? translate.instant('Practices.Labels_Navigation_ActiveMenuItem') : '';
}
