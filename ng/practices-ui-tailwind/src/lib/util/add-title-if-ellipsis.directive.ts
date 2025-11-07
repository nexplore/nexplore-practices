import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiAddTitleIfEllipsis]',
})
export class PuiAddTitleIfEllipsisDirective implements AfterViewInit {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);


    ngAfterViewInit(): void {
        const element = this.elementRef.nativeElement;
        if (element.offsetWidth < element.scrollWidth) {
            element.title = element.innerText;
        }
    }
}

