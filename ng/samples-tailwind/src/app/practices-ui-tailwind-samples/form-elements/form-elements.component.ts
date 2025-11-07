import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { command } from '@nexplore/practices-ng-commands';
import { formGroup } from '@nexplore/practices-ng-forms';
import { IQueryParamsWithFilter, TitleService } from '@nexplore/practices-ui';
import {
    PracticesTailwindFormComponentsModule,
    PuiFormDirective,
    PuiInpageSearchComponent,
    SelectViewSource,
} from '@nexplore/practices-ui-tailwind';
import { BehaviorSubject, debounceTime, delay, firstValueFrom, map, of, timer } from 'rxjs';

interface IItem {
    id: number;
    name: string;
    category: string;
}

const items: IItem[] = [
    { id: 1, name: 'Pizza Margarita', category: 'Vegetarisch' },
    { id: 2, name: 'Hamburger', category: 'Fleisch' },
    { id: 3, name: 'Chicken Nuggets', category: 'Fleisch' },
    { id: 4, name: 'Bratwurst', category: 'Fleisch' },
    { id: 5, name: 'Raclette', category: 'Vegetarisch' },
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

@Component({
    standalone: true,
    selector: 'app-form-elements',
    templateUrl: './form-elements.component.html',
    imports: [
        PracticesTailwindFormComponentsModule,
        FormsModule,
        ReactiveFormsModule,
        AsyncPipe,
        PuiInpageSearchComponent,
        PuiFormDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormElementsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private readonly _titleService = inject(TitleService);
    private router = inject(Router);

    foods = items;
    foodSource = new SelectViewSource<IItem>({ label: 'name', value: 'id' }, defaultLoadFn);
    readonly: boolean;

    // This is an example of the enhanced formGroup builder
    mainForm = formGroup.withBuilder(({ control }) => ({
        svnumber: control<string>(null, [this.svNumberValidator]),
        basicText: control<string>(null),
        basicTextWithNotice: control<string>(null),
        basicNumber: control<number>(null),
        basicDate: control<Date>(null),
        birthDate: control<Date>(null),
        monthDate: control<Date>(null),
        year: control<number>(null),
        basicCombobox: control<number>(null),
        requiredCombobox: control<number>(null, Validators.required),
        asyncCombobox: control<number>(null),
        nonSearchableCombobox: control<number>(null),
        requiredText: control<string>(null, Validators.required),
        requiredNumber: control<number>(null, Validators.required),
        inputWithPlaceholder: control<string>(null),
        inputWithHiddenOptionalLabel: control<string>(null),
        requiredInputWithInitialValue: control<string>('Hello World', Validators.required),
        validatorWithParameter: control<number>(null, Validators.min(4)),
        asyncValidator: control<string>(null, [], (c) =>
            of(!c.value || c.value === 'bob')
                .pipe(delay(2000))
                .pipe(
                    map((result) => {
                        return !result ? { notBob: true } : null;
                    }),
                ),
        ),
        disabled: control<string>({ value: 'Lol', disabled: true }),
        basicTextWithCustomId: control<string>(null),
        // checkboxes
        basic1: control<boolean>(null),
        basic2: control<boolean>(null),
        basic3: control<boolean>(null),
        basic4: control<boolean>(null),
        basic5: control<boolean>(null),
        // radio
        radio: control<string>(null),
        file: control<File>(null),
        requiredFile: control<File>(null, Validators.required),
    }));

    myCoolModel: number;

    searchPendingSubject = new BehaviorSubject(false);
    searchPending$ = this.searchPendingSubject.pipe(
        debounceTime(100),
        map((result) => result),
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly saveCommand = command.actionSaveForm(this.mainForm, async (params?: { navigateBackToList: boolean }) => {
        await firstValueFrom(timer(3000));
        this.mainForm.markAsPristine();
        this.mainForm.markAsUntouched();

        if (params?.navigateBackToList) {
            return await this.router.navigate(['/']);
        }
    });

    ngOnInit() {
        this._titleService.setBreadcrumbTitle('A very sleek breadcrumb title');
        this._titleService.setTitle("LOL, I've overridden the page title with a ridiculously long one.", {
            localize: false,
        });
    }

    search() {
        this.searchPendingSubject.next(true);

        // do some async work here, if done set pending to false
        timer(500).subscribe(() => this.searchPendingSubject.next(false));
    }

    toggleReadonly() {
        this.readonly = !this.readonly;
    }

    logFormFields() {
        console.log(this.mainForm.getRawValue());
    }

    svNrFormatter(input: string): string {
        // check if correct dot was entered.
        if (/^\d{3}\.$/m.test(input) || /^\d{3}\.\d{4}\.$/m.test(input) || /^\d{3}\.\d{4}\.\d{4}\.$/m.test(input)) {
            return input;
        }

        // Format value automatically.
        const pattern = 'xxx.xxxx.xxxx.xx';
        const inputNumbersOnly = input.replace(/\D+/g, '');
        let pos = 0;
        let newValue = '';
        pattern.split('.').forEach((subpattern) => {
            if (pos + subpattern.length < inputNumbersOnly.length) {
                newValue = newValue + inputNumbersOnly.substring(pos, pos + subpattern.length) + '.';
                pos += subpattern.length;
            } else if (pos < inputNumbersOnly.length) {
                newValue = newValue + inputNumbersOnly.substring(pos);
                pos = inputNumbersOnly.length;
            }
        });

        return newValue.substring(0, pattern.length);
    }

    svNumberValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) return null;

        const numbersOnly = value.replace(/\./g, '');
        if (numbersOnly.length !== 13) return { svNumberMustHave13Digits: true };

        // verify checksum -> valid example = 756.1234.5678.97
        const lastDigit = Number(numbersOnly.substring(numbersOnly.length - 1));
        const digits = numbersOnly
            .substring(0, numbersOnly.length - 1)
            .split('')
            .reverse();

        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            sum += i % 2 === 0 ? Number(digits[i]) * 3 : Number(digits[i]);
        }

        return (10 - (sum % 10)) % 10 === lastDigit ? null : { svNumberIsNotValid: true };
    }
}

