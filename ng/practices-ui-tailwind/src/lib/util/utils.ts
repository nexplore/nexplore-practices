import { ElementRef } from '@angular/core';

export function setAttr(attr: string, value: string | boolean, element: HTMLElement) {
    if (value === undefined || value === null || value === false) {
        element.removeAttribute(attr);
    } else {
        element.setAttribute(attr, value === true ? '' : value);
    }
}

export function setHostAttr(attr: string, value: string | boolean, elementRef: ElementRef<HTMLElement>) {
    return setAttr(attr, value, elementRef.nativeElement);
}

export function setClassNames(classNames: { [key: string]: boolean }, element: HTMLElement) {
    Object.entries(classNames)
        .map(([key, value]) => key.split(' ').map<[string, boolean]>((k) => [k, value]))
        .reduce((acc, val) => acc.concat(val), [])
        .forEach(([key, value]) => {
            if (!key) {
                return;
            }

            if (value === true) {
                element.classList.add(key);
            } else {
                element.classList.remove(key);
            }
        });
}

export function setHostClassNames(
    classNames: { [key: string]: boolean },
    elementRef: HTMLElement | ElementRef<HTMLElement>,
) {
    return setClassNames(classNames, (elementRef as ElementRef)?.nativeElement ?? elementRef);
}

export function trimChars(str: string, trimChars: string, options?: { end?: boolean; start?: boolean }) {
    options = options ?? { start: true, end: true };
    if (options.start && str.startsWith(trimChars)) {
        str = str.slice(trimChars.length);
    }

    if (options.end && str.endsWith(trimChars)) {
        str = str.slice(0, -trimChars.length);
    }

    return str;
}

// https://stackoverflow.com/questions/35939886/find-first-scrollable-parent
export function getScrollParent(node: Element) {
    const parentNode = node?.parentElement;
    if (!parentNode) {
        return document;
    }

    if (parentNode.scrollHeight > parentNode.clientHeight) {
        const style = getComputedStyle(parentNode);
        if (style.position === 'fixed') return document;
        const overflowRegex = /(auto|scroll)/;
        if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
            return parentNode;
        }
    }

    return getScrollParent(parentNode as Element);
}

/**
 * Compare a url string with a wildcard string
 *
 * @param url The url to test
 * @param wildcardText a url string containing either `*` wildcards or positional parameters like `:id` (DO NOT COMBINE `*` and `:`-placeholders)
 */
export function compareUrlWithWildcards(url: string | null, wildcardText: string | RegExp | null): boolean {
    if (!url) {
        return url === wildcardText;
    }

    if (wildcardText instanceof RegExp) {
        return wildcardText.test(url);
    }

    if (!wildcardText) {
        return url === wildcardText;
    }

    if (!wildcardText.includes('*') && !wildcardText.includes(':')) {
        return url?.toLowerCase() === wildcardText?.toLowerCase();
    }

    // for this solution to work on any string, no matter what characters it has
    // eslint-disable-next-line no-useless-escape
    const escapeRegex = (str: string): string => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/gi, '\\$1');

    // Split by /, replace :params with actual url positon, join again
    const urlSplitted = url.split('/');
    wildcardText = wildcardText
        .split('/')
        .map((t, i) => (t.startsWith(':') ? (urlSplitted[i] ?? t) : t))
        .join('/');

    // "."  => Find a single character, except newline or line terminator
    // ".*" => Matches any string that contains zero or more characters
    let rule = wildcardText.split('*').map(escapeRegex).join('.*');

    // "^"  => Matches any string with the following at the beginning of it
    // "$"  => Matches any string with that in front at the end of it
    rule = '^' + rule + '$';

    // Create a regular expression object for matching string
    const regex = new RegExp(rule);

    // Returns true if it finds a match, otherwise it returns false
    return regex.test(url);
}

export function isElementVisibleInVerticalScrollView(el: HTMLElement, minimumVisibleHeightPx = 0) {
    const scrollParent = getScrollParent(el) ?? document.scrollingElement;
    const { top, bottom, height } = el.getBoundingClientRect();
    const parentRect =
        scrollParent === document
            ? { top: 0, bottom: document.documentElement.offsetHeight }
            : (scrollParent as Element).getBoundingClientRect();

    if (top <= parentRect.top) {
        return parentRect.top - top <= height;
    } else {
        return bottom - parentRect.bottom <= height - minimumVisibleHeightPx;
    }
}

export function splitArrayChunks<T>(array: T[], n: number): T[][] {
    if (!array?.length) {
        return [];
    }

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += n) {
        result.push(array.slice(i, i + n));
    }

    return result;
}

export function isDefinedAndNotEmptyArray(value: any): boolean {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (Array.isArray(value) && value.length === 0)
    ) {
        return false;
    } else {
        return true;
    }
}

