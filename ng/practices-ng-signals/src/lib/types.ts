import type { Signal } from '@angular/core';
import type { Observable } from 'rxjs';

export type SignalSource<TSource> = Signal<TSource> | (() => TSource) | Observable<TSource>;
export type SignalOrObservable<T> = Signal<T> | Observable<T> | T;
