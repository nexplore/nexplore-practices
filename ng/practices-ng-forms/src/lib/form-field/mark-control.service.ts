import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class PuiMarkControlService implements OnDestroy {
    private _touchedSubject = new Subject<void>();

    get touched$(): Observable<void> {
        return this._touchedSubject.asObservable();
    }

    markAsTouched() {
        this._touchedSubject.next();
    }

    ngOnDestroy() {
        this._touchedSubject.complete();
    }
}
