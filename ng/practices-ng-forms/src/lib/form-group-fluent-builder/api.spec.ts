import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { describe, expect, it } from '@jest/globals';
import { formGroup } from './api';

describe('formGroup', () => {
    it('Works as expected when signal reset and validation are combined', () => {
        class TestDto {
            constructor(public name: string, public nickname: string | null = null) {}
        }

        TestBed.runInInjectionContext(() => {
            const results: {
                name: string | null;
                nameValid: boolean;
                nickname: string | null;
                nicknameValid: boolean;
            }[] = [];
            const pushResults = () => {
                results.push({
                    name: fg.value.name,
                    nameValid: fg.controls.name.valid,
                    nickname: fg.value.nickname,
                    nicknameValid: fg.controls.nickname.valid,
                });
            };

            const sourceSignal = signal<TestDto | null>(null);
            const isRequiredSignal = signal<boolean>(false);

            const fg1 = formGroup.withType(TestDto, { name: null, nickname: null });
            const fg2 = fg1.withResetFromSignal(sourceSignal);
            const fg3 = fg2.withValidation(({ conditional, dependent }) => ({
                name: [conditional(() => isRequiredSignal() && Validators.required)],
                nickname: [
                    Validators.maxLength(4),
                    dependent(
                        ({ name, nickname }) =>
                            name && nickname && !name.includes(nickname) && { nicknameMustBeShortVersionOfName: true }
                    ),
                ],
            }));
            const fg = fg3;

            TestBed.flushEffects();
            pushResults();

            isRequiredSignal.set(true);
            TestBed.flushEffects();
            pushResults();

            sourceSignal.set(new TestDto('John Doe'));

            TestBed.flushEffects();
            pushResults();

            fg.patchValue({ nickname: 'John' });

            TestBed.flushEffects();
            pushResults();

            fg.patchValue({ nickname: 'Lisa' });

            TestBed.flushEffects();
            pushResults();

            fg.patchValue({ nickname: 'Johnny' });

            TestBed.flushEffects();
            pushResults();

            fg.patchValue({ nickname: 'Jo' });

            TestBed.flushEffects();
            pushResults();

            expect(results).toEqual([
                { name: null, nameValid: true, nickname: null, nicknameValid: true },
                { name: null, nameValid: false, nickname: null, nicknameValid: true },
                { name: 'John Doe', nameValid: true, nickname: null, nicknameValid: true },
                { name: 'John Doe', nameValid: true, nickname: 'John', nicknameValid: true },
                { name: 'John Doe', nameValid: true, nickname: 'Lisa', nicknameValid: false },
                { name: 'John Doe', nameValid: true, nickname: 'Johnny', nicknameValid: false },
                { name: 'John Doe', nameValid: true, nickname: 'Jo', nicknameValid: true },
            ]);
        });
    });
});
