import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PuiCalendarYearViewService {
    readonly yearsPerColumn = 7;
    readonly yearsPerRow = 5;

    get yearsPerView() {
        return this.yearsPerColumn * this.yearsPerRow;
    }

    public getStartDecade(year: number) {
        const referenceYear = new Date().getFullYear() + 1;
        const diffToRef = referenceYear - year;
        const startDecade =
            diffToRef > this.yearsPerView
                ? referenceYear - Math.ceil(diffToRef / this.yearsPerView) * this.yearsPerView
                : diffToRef <= 0
                  ? referenceYear + Math.floor((-1 * diffToRef) / this.yearsPerView) * this.yearsPerView
                  : referenceYear - this.yearsPerView;
        return startDecade;
    }

    public getEndDecade(year: number) {
        return this.getStartDecade(year) + this.yearsPerView - 1;
    }

    getYearRangeLabel(year: number) {
        const startDecade = this.getStartDecade(year);
        const endDecade = this.getEndDecade(year);
        return `${startDecade} - ${endDecade}`;
    }
}

