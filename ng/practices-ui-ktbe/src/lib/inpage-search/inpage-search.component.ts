import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { PuibeIconSearchComponent } from '../icons/icon-search.component';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'puibe-inpage-search',
    standalone: true,
    imports: [AsyncPipe, FormsModule, TranslateModule, PuibeIconSearchComponent, PuibeIconSpinnerComponent, NgIf],
    templateUrl: './inpage-search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => PuibeInpageSearchComponent),
        },
    ],
})
export class PuibeInpageSearchComponent implements ControlValueAccessor {
    @Input()
    placeholder?: string;

    @Input()
    label?: string;

    @Input()
    pending?: boolean;

    @Input()
    set searchTerm(searchTerm: string | undefined) {
        this.searchTermSubject.next(searchTerm);
        this.onSearchTermChange(searchTerm);
    }

    @Output()
    searchTermChange = new EventEmitter<string>();

    onChange?: (searchTerm: string) => void;

    private searchTermSubject = new BehaviorSubject<string | undefined>(undefined);
    searchTerm$ = this.searchTermSubject.asObservable();

    onSearchTermChange(searchTerm: string) {
        if (this.onChange) {
            this.onChange(searchTerm);
        }
        this.searchTermChange.emit(searchTerm);
    }

    writeValue(value: string): void {
        this.searchTermSubject.next(value);
    }

    registerOnChange(fn: (searchTerm: string) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(_fn: () => void): void {}
}
