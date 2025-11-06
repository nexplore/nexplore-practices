import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export type SignalSource<TSource> = Signal<TSource> | (() => TSource) | Observable<TSource>;
export type SignalOrObservable<T> = Signal<T> | Observable<T> | T;
