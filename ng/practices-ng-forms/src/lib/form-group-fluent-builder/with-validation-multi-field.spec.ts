import { TestBed } from '@angular/core/testing';
import { Validators } from "@angular/forms";
import { signal } from '@angular/core';
import { formGroup } from './api';

describe('withValidationMultiField', () => {
  it('should add multi-field validation to form group', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      const fg = formGroup
        .withBuilder(({ control }) => ({
          field1: control<string | null>(null),
          field2: control<string | null>(null)
        }))
        .withMultiFieldValidation(({ field1, field2 }) => !field1 && !field2 && { atLeastOneFieldRequired: true });

      // Initial state
      TestBed.flushEffects();
      
      // Capture errors after initial state
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set field1 value
      fg.controls.field1.setValue('value');
      TestBed.flushEffects();
      
      // Capture errors after setting field1
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "field1": {
            "atLeastOneFieldRequired": true
          },
          "field2": {
            "atLeastOneFieldRequired": true
          }
        },
        {
          "field1": null,
          "field2": null
        }
      ]);
    });
  });

  it('should also work when withValidation is used at the same time', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      const fg = formGroup
        .withBuilder(({ control }) => ({
          field1: control<string | null>(null),
          field2: control<string | null>(null)
        }))
        .withValidation({
          field1: [Validators.required],
          field2: [Validators.required]
        })
        .withMultiFieldValidation(({ field1, field2 }) => !field1 && !field2 && { atLeastOneFieldRequired: true });

      // Initial state
      TestBed.flushEffects();
      
      // Capture errors after initial state
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set field1 value
      fg.controls.field1.setValue('value');
      TestBed.flushEffects();
      
      // Capture errors after setting field1
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set field2 value
      fg.controls.field2.setValue('value');
      TestBed.flushEffects();
      
      // Capture errors after setting field2
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "field1": {
            "atLeastOneFieldRequired": true,
            "required": true
          },
          "field2": {
            "atLeastOneFieldRequired": true,
            "required": true
          }
        },
        {
          "field1": null,
          "field2": {
            "required": true
          }
        },
        {
          "field1": null,
          "field2": null
        }
      ]);
    });
  });

  it('should handle changing both fields in sequence', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      const fg = formGroup
        .withBuilder(({ control }) => ({
          field1: control<string | null>(null),
          field2: control<string | null>(null)
        }))
        .withMultiFieldValidation(({ field1, field2 }) => !field1 && !field2 && { atLeastOneFieldRequired: true });

      // Initial state
      TestBed.flushEffects();
      
      // Capture errors after initial state
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set field1 value
      fg.controls.field1.setValue('value1');
      TestBed.flushEffects();
      
      // Capture errors after setting field1
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set field2 value
      fg.controls.field2.setValue('value2');
      TestBed.flushEffects();
      
      // Capture errors after setting field2
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });
      
      // Clear both fields again
      fg.controls.field1.setValue(null);
      TestBed.flushEffects();
      
      // Capture errors after clearing field1
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });
      
      // Clear field2
      fg.controls.field2.setValue(null);
      TestBed.flushEffects();
      
      // Capture errors after clearing field2
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "field1": {
            "atLeastOneFieldRequired": true
          },
          "field2": {
            "atLeastOneFieldRequired": true
          }
        },
        {
          "field1": null,
          "field2": null
        },
        {
          "field1": null,
          "field2": null
        },
        {
          "field1": null,
          "field2": null
        },
        {
          "field1": {
            "atLeastOneFieldRequired": true
          },
          "field2": {
            "atLeastOneFieldRequired": true
          }
        }
      ]);
    });
  });

  it('should handle form group reset behavior properly', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      const fg = formGroup
        .withBuilder(({ control }) => ({
          field1: control<string | null>(null),
          field2: control<string | null>(null)
        }))
        .withMultiFieldValidation(({ field1, field2 }) => !field1 && !field2 && { atLeastOneFieldRequired: true });

      // Initial state
      TestBed.flushEffects();
      
      // Capture errors after initial state
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Set values
      fg.controls.field1.setValue('value1');
      fg.controls.field2.setValue('value2');
      TestBed.flushEffects();
      
      // Capture errors after setting values
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Reset form
      fg.reset();
      TestBed.flushEffects();
      
      // Capture errors after reset
      results.push({
        field1: fg.controls.field1.errors,
        field2: fg.controls.field2.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "field1": {
            "atLeastOneFieldRequired": true
          },
          "field2": {
            "atLeastOneFieldRequired": true
          }
        },
        {
          "field1": null,
          "field2": null
        },
        {
          "field1": {
            "atLeastOneFieldRequired": true
          },
          "field2": {
            "atLeastOneFieldRequired": true
          }
        }
      ]);
    });
  });

  it('should use signal value within validation function', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      
      // Create a signal that will be used in the validation function
      const minLengthSignal = signal(3);
      
      const fg = formGroup
        .withBuilder(({ control }) => ({
          field1: control<string | null>(null)
        }))
        .withMultiFieldValidation(({ field1 }) => {
          const minLength = minLengthSignal();
          if (field1 && field1.length < minLength) {
            return { minLengthError: `Minimum length should be ${minLength}` };
          }
          return null;
        });

      // Initial state
      TestBed.flushEffects();
      
      // Capture errors after initial state
      results.push({
        field1: fg.controls.field1.errors
      });

      // Set too short value
      fg.controls.field1.setValue('ab');
      TestBed.flushEffects();
      
      // Capture errors after setting short value
      results.push({
        field1: fg.controls.field1.errors
      });

      // Set valid value
      fg.controls.field1.setValue('abcd');
      TestBed.flushEffects();
      
      // Capture errors after setting valid value
      results.push({
        field1: fg.controls.field1.errors
      });
      
      // Change the min length signal
      minLengthSignal.set(5);
      TestBed.flushEffects();
      
      // Capture errors after changing the min length
      results.push({
        field1: fg.controls.field1.errors
      });

      // Set longer valid value
      fg.controls.field1.setValue('abcdef');
      TestBed.flushEffects();
      
      // Capture errors after setting longer valid value
      results.push({
        field1: fg.controls.field1.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "field1": null
        },
        {
          "field1": {
            "minLengthError": "Minimum length should be 3"
          }
        },
        {
          "field1": null
        },
        {
          "field1": {
            "minLengthError": "Minimum length should be 5"
          }
        },
        {
          "field1": null
        }
      ]);
    });
  });

  it('should support multiple multi-field validations applied in sequence', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      
      // Create form with three fields to test different validation rules
      const fg = formGroup
        .withBuilder(({ control }) => ({
          email: control<string | null>(null),
          phone: control<string | null>(null),
          preferences: control<string | null>(null)
        }))
        // First multi-field validation: Either email or phone is required
        .withMultiFieldValidation(({ email, phone }) => {
          if (!email && !phone) {
            return { contactRequired: true };
          }
          return null;
        }, ['email', 'phone'])
        // Second multi-field validation: If neither email nor phone, preferences cannot be set
        .withMultiFieldValidation(({ email, phone, preferences }) => {
          if (!email && !phone && preferences) {
            return { contactRequiredForPreferences: true };
          }
          return null;
        }, ['preferences']);

      // Initial state - no fields set
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Set preferences without contact - should fail second validation
      fg.controls.preferences.setValue('email updates');
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Add email - should fix both validations
      fg.controls.email.setValue('user@example.com');
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Remove email, add phone - should also fix both validations
      fg.controls.email.setValue(null);
      fg.controls.phone.setValue('123-456-7890');
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Remove both contact methods - should fail first validation
      // and also fail second validation since preferences is still set
      fg.controls.phone.setValue(null);
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Remove preferences - first validation should still fail
      // but second validation should pass
      fg.controls.preferences.setValue(null);
      TestBed.flushEffects();
      
      results.push({
        email: fg.controls.email.errors,
        phone: fg.controls.phone.errors,
        preferences: fg.controls.preferences.errors
      });

      // Check the results
      expect(results).toEqual([
        {
          "email": {
            "contactRequired": true
          },
          "phone": {
            "contactRequired": true
          },
          "preferences": null
        },
        {
          "email": {
            "contactRequired": true
          },
          "phone": {
            "contactRequired": true
          },
          "preferences": {
            "contactRequiredForPreferences": true
          }
        },
        {
          "email": null,
          "phone": null,
          "preferences": null
        },
        {
          "email": null,
          "phone": null,
          "preferences": null
        },
        {
          "email": {
            "contactRequired": true
          },
          "phone": {
            "contactRequired": true
          },
          "preferences": {
            "contactRequiredForPreferences": true
          }
        },
        {
          "email": {
            "contactRequired": true
          },
          "phone": {
            "contactRequired": true
          },
          "preferences": null
        }
      ]);
    });
  });

  it('should apply validation errors only to specified controlNames', () => {
    TestBed.runInInjectionContext(() => {
      const results: any[] = [];
      
      // Create form with three fields but only apply validation errors to specific fields
      const fg = formGroup
        .withBuilder(({ control }) => ({
          firstName: control<string | null>(null),
          lastName: control<string | null>(null),
          address: control<string | null>(null)
        }))
        // Multi-field validation with explicit controlNames parameter
        .withMultiFieldValidation(({ firstName, lastName, address }) => {
          // Validation requiring either first+last name or address
          if ((!firstName || !lastName) && !address) {
            return { completeInfoRequired: true };
          }
          return null;
        }, ['firstName', 'lastName']); // Only apply errors to name fields, not address
      
      // Initial state - all fields empty
      TestBed.flushEffects();
      
      results.push({
        firstName: fg.controls.firstName.errors,
        lastName: fg.controls.lastName.errors,
        address: fg.controls.address.errors
      });
      
      // Set address - should make all fields valid
      fg.controls.address.setValue('123 Main St');
      TestBed.flushEffects();
      
      results.push({
        firstName: fg.controls.firstName.errors,
        lastName: fg.controls.lastName.errors,
        address: fg.controls.address.errors
      });
      
      // Clear address, set firstName only - both firstName and lastName should still be invalid
      // since the validation requires both firstName AND lastName to be set when address is empty
      fg.controls.address.setValue(null);
      fg.controls.firstName.setValue('John');
      TestBed.flushEffects();
      
      results.push({
        firstName: fg.controls.firstName.errors,
        lastName: fg.controls.lastName.errors,
        address: fg.controls.address.errors
      });
      
      // Set lastName too - all fields should be valid
      fg.controls.lastName.setValue('Doe');
      TestBed.flushEffects();
      
      results.push({
        firstName: fg.controls.firstName.errors,
        lastName: fg.controls.lastName.errors,
        address: fg.controls.address.errors
      });
      
      // Check the results - notice address is never invalid even though it's part of the validation logic
      expect(results).toEqual([
        {
          "firstName": {
            "completeInfoRequired": true
          },
          "lastName": {
            "completeInfoRequired": true
          },
          "address": null
        },
        {
          "firstName": null,
          "lastName": null,
          "address": null
        },
        {
          "firstName": {
            "completeInfoRequired": true
          },
          "lastName": {
            "completeInfoRequired": true
          },
          "address": null
        },
        {
          "firstName": null,
          "lastName": null,
          "address": null
        }
      ]);
    });
  });
});
