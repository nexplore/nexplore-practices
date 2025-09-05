import { ObservableInput } from 'rxjs';

export interface DialogOptions {
    title: string;
    message: string;
    dialogActions: DialogAction[];
    treatMessageAsHtml?: boolean;
}

export interface DialogAction<T = unknown> {
    label: string;
    class?: string;
    handle?: () => ObservableInput<T> | T;
}
