import { Observable, Subscription, takeUntil } from 'rxjs';

type LegacyCommandLike = {
    trigger: (args: any, options?: any) => boolean;
    error$: Observable<any>;
    result$: Observable<any>;
    completed$: Observable<any>;
    triggerAsync?: (args: any, options?: any) => Promise<any>;
};
export function triggerLegacyCommandAsync<TResult>(
    command: LegacyCommandLike,
    args: any,
    abortSignal?: AbortSignal
): Promise<TResult | null> {
    if ('triggerAsync' in command && command.triggerAsync) {
        return command.triggerAsync(args);
    }
    return new Promise((resolve, reject) => {
        const subscription = new Subscription();

        subscription.add(
            command.result$.pipe(takeUntil(command.completed$)).subscribe((result) => {
                resolve(result);
            })
        );

        subscription.add(
            command.error$.pipe(takeUntil(command.completed$)).subscribe((e) => {
                reject(e);
            })
        );

        if (abortSignal) {
            abortSignal.onabort = () => {
                subscription.unsubscribe();
                resolve(null);
            };
        }

        const wasTriggered = command.trigger(args!);

        if (!wasTriggered) {
            subscription.unsubscribe();
            resolve(null);
        }
    });
}
