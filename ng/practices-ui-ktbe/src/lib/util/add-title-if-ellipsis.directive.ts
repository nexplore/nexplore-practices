import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puibeAddTitleIfEllipsis]',
})
export class PuibeAddTitleIfEllipsisDirective implements AfterViewInit {
    constructor(private elementRef: ElementRef<HTMLElement>) {}

    ngAfterViewInit(): void {
        const element = this.elementRef.nativeElement;
        if (element.offsetWidth < element.scrollWidth) {
            element.title = element.innerText;
        }
    }
}
