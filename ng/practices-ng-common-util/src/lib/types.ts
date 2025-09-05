import { Signal } from '@angular/core';

export type ValueOrGetter<T> = T | (() => T);

export type ValueOrSignal<T> = T | Signal<T>;


export type StringKeyOf<T> = Exclude<keyof T, symbol | number>;
