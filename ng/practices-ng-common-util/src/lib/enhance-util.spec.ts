import { describe, expect, it, jest } from '@jest/globals';
import { enhance } from './enhance-util';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';

describe('enhance', () => {
  it('should enhance an object with simple properties', () => {
    const obj = { name: 'Original' };
    const enhanced = enhance(obj, {
      age: 30,
      active: true
    });

    expect(enhanced).toBe(obj); // Same reference
    expect(enhanced.name).toBe('Original');
    expect(enhanced.age).toBe(30);
    expect(enhanced.active).toBe(true);
  });

  it('should enhance an object using a function', () => {
    const obj = { count: 10 };
    const enhanced = enhance(obj, (source) => ({
      doubled: source.count * 2,
      description: `Count is ${source.count}`
    }));

    expect(enhanced).toBe(obj);
    expect(enhanced.count).toBe(10);
    expect(enhanced.doubled).toBe(20);
    expect(enhanced.description).toBe('Count is 10');
  });

  it('should handle signals', () => {
    // Use a real signal
    const nameSignal = signal('John');
    const obj = { id: 1 };

    const enhanced = enhance(obj, {
      nameSignal: nameSignal
    });

    expect(enhanced.nameSignal()).toBe('John');

    nameSignal.set('Jane');
    expect(enhanced.nameSignal()).toBe('Jane');
  });

  it('should handle observables', () => {
    // Use a real observable
    const statusSubject = new Subject<string>();
    const obj = { id: 1 };

    const enhanced = enhance(obj, {
      status: statusSubject
    });

    // The enhanced property should be the observable itself
    expect(enhanced.status).toBe(statusSubject);
  });

  it('should handle property descriptors', () => {
    const obj = { first: 'John' };

    let lastName = 'Doe';
    const enhanced = enhance(obj, {
      fullName: {
        get: () => `${obj.first} ${lastName}`,
        configurable: true
      },
      lastName: {
        get: () => lastName,
        set: (value: string) => { lastName = value; },
        configurable: true
      }
    });

    expect(enhanced.fullName).toBe('John Doe');

    // Test setter
    enhanced.lastName = 'Smith';
    expect(lastName).toBe('Smith');
    expect(enhanced.fullName).toBe('John Smith');
  });

  it('should handle property descriptor with value', () => {
    const obj = {};

    const enhanced = enhance(obj, {
      constant: {
        value: 42,
        writable: false,
        configurable: true
      }
    });

    expect(enhanced.constant).toBe(42);

    // Verify property is not writable
    expect(() => {
      (enhanced as any).constant = 100;
    }).toThrow(TypeError);
    expect(enhanced.constant).toBe(42);
  });

  it('should handle complex mixed enhancements', () => {
    // Use real signal and observable
    const countSignal = signal(5);
    const statusObservable = of('pending');

    const obj = { name: 'Task' };

    const enhanced = enhance(obj, {
      count: countSignal,
      status: statusObservable,
      isActive: true,
      description: {
        get: () => `${obj.name} (Count: ${countSignal()})`,
        configurable: true
      }
    });

    expect(enhanced.name).toBe('Task');
    expect(enhanced.count).toBe(countSignal);
    expect(enhanced.status).toBe(statusObservable);
    expect(enhanced.isActive).toBe(true);
    expect(enhanced.description).toBe('Task (Count: 5)');

    // Update signal and verify description updates
    countSignal.set(10);
    expect(enhanced.description).toBe('Task (Count: 10)');
  });

  it('should handle null or undefined enhancement values', () => {
    const obj = { existing: true };

    const enhanced = enhance(obj, {
      nullProp: null,
      undefinedProp: undefined
    });

    expect(enhanced.nullProp).toBeNull();
    expect(enhanced.undefinedProp).toBeUndefined();
  });
});
