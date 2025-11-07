import { ChangeDetectionStrategy, Component, QueryList, ViewChildren, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IQueryParamsWithFilter } from '@nexplore/practices-ui';
import {
    FORM_CONFIG,
    FormConfig,
    PracticesTailwindFormComponentsModule,
    PuiFormDirective,
    SelectViewSource,
} from '@nexplore/practices-ui-tailwind';
import { NgSelectModule } from '@ng-select/ng-select';
import { delay, map, of, timer } from 'rxjs';

interface IItem {
    id: number;
    name: string;
}

const items = [
    { id: 1, name: 'Pizza' },
    { id: 2, name: 'Hamburger' },
    { id: 3, name: 'Chicken Nuggets' },
    { id: 4, name: 'Bratwurst' },
    { id: 5, name: 'Raclette' },
];

function defaultLoadFn(params: IQueryParamsWithFilter<IItem>) {
    const filteredItems = [...items].filter(
        (i) =>
            !params.filter.name ||
            i.name.includes(params.filter.name) ||
            i.name.toLowerCase().includes(params.filter.name),
    );
    return timer(1000).pipe(map((_) => ({ data: filteredItems, total: filteredItems.length })));
}

const formConfig: FormConfig = {
    hideInvalidIfUntouched: true,
    useSearchIconIfSelectSearchable: false,
};

@Component({
    standalone: true,
    selector: 'app-form-with-hide-invalid',
    templateUrl: './form-with-hide-invalid.component.html',
    imports: [PracticesTailwindFormComponentsModule, FormsModule, ReactiveFormsModule, NgSelectModule],
    providers: [
        {
            provide: FORM_CONFIG,
            useValue: formConfig,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormWithHideInvalidComponent {
    private _fb = inject(FormBuilder);

    @ViewChildren(PuiFormDirective) forms: QueryList<PuiFormDirective>;

    foods = items;
    foodSource = new SelectViewSource<IItem>({ label: 'name', value: 'id' }, defaultLoadFn);

    mainForm = this._fb.group({
        // Fields
        requiredText: this._fb.control<string>(null, Validators.required),
        requiredNumber: this._fb.control<number>(null, Validators.required),
        requiredDate: this._fb.control<Date>(null, Validators.required),
        requiredCombobox: this._fb.control<number>(null, Validators.required),
        requiredAsyncCombobox: this._fb.control<number>(null, Validators.required),
        requiredInputWithInitialValue: this._fb.control<string>('Hello World', Validators.required),
        asyncValidator: this._fb.control<string>(null, [], (c) =>
            of(c.value === 'bob')
                .pipe(delay(2000))
                .pipe(
                    map((result) => {
                        return !result ? { notBob: true } : null;
                    }),
                ),
        ),
        requiredFileInput: this._fb.control<File>(null, Validators.required),

        // Checkboxes
        requiredCheckbox: this._fb.control<boolean>(null, Validators.requiredTrue),

        // Radio buttons
        requiredRadioButtonGroup: this._fb.control<string>(null, Validators.required),
    });

    cbForm = this._fb.group({
        checkbox1: this._fb.control<boolean>(null),
        checkbox2: this._fb.control<boolean>(null),
        checkbox3: this._fb.control<boolean>(null),
        requiredCheckbox4: this._fb.control<boolean>(null, Validators.requiredTrue),
        checkbox5: this._fb.control<boolean>(null),
    });

    myCoolModel: number;

    fakeSubmit() {
        this.forms.forEach((partialForm) => partialForm.markAsTouched());
    }
}

