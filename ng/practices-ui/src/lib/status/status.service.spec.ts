import { TestBed } from '@angular/core/testing';
import { describe, expect, it, jest } from '@jest/globals';
import { distinctUntilChanged, first, firstValueFrom, shareReplay, Subject, take, timer } from 'rxjs';
import { LegacyCommand } from '../command';
import { IListResult, ListViewSource } from '../list';
import { StatusEvent } from './model';
import { StatusHubService } from './status-hub.service';
import { StatusService } from './status.service';

describe('StatusService', () => {
    describe('registerCommand', () => {
        it('should not have _currentlyActiveStatusSubscription before triggering', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);

            const statusHub = new StatusHubService();
            const statusHubSubject = new Subject<StatusEvent>();
            jest.spyOn(statusHub, 'register')
                .mockImplementation((observable) =>
                    observable.subscribe((n) => {
                        statusHubSubject.next(n);
                    }),
                )
                .mockName('statusHub.register()');
            const statusService = new StatusService(statusHub);

            const commandWithStatus = statusService.registerCommand(command);

            expect(commandWithStatus._currentlyActiveStatusSubscription).toBeUndefined();
        });

        it('should have open _currentlyActiveStatusSubscription after triggering', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);

            const statusHub = new StatusHubService();
            const statusHubSubject = new Subject<StatusEvent>();
            jest.spyOn(statusHub, 'register')
                .mockImplementation((observable) =>
                    observable.subscribe((n) => {
                        statusHubSubject.next(n);
                    }),
                )
                .mockName('statusHub.register()');
            const statusService = new StatusService(statusHub);

            const commandWithStatus = statusService.registerCommand(command);

            commandWithStatus.trigger();

            expect(commandWithStatus._currentlyActiveStatusSubscription).toMatchObject({ closed: false });
        });

        it('should not leak subscriptions to command observables', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);

            const statusHub = new StatusHubService();
            const statusHubSubject = new Subject<StatusEvent>();
            const statusHubObs$ = statusHubSubject.asObservable().pipe(shareReplay({ refCount: true, bufferSize: 1 }));
            const replaySubscription = statusHubObs$.subscribe();
            jest.spyOn(statusHub, 'register')
                .mockImplementation((observable) =>
                    observable.subscribe((n) => {
                        statusHubSubject.next(n);
                    }),
                )
                .mockName('statusHub.register()');
            const statusService = new StatusService(statusHub);

            const commandWithStatus = statusService.registerCommand(command);

            commandWithStatus.trigger();

            await firstValueFrom(statusHubObs$);

            completionSubject.next();

            expect(commandWithStatus._currentlyActiveStatusSubscription).toMatchObject({ closed: true });
            replaySubscription.unsubscribe();
        }, 100);
    });

    describe('subscribeToCommand', () => {
        it('should emit final status to statusHub when unsubscribing from statusService, even when no value has emitted', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);

            const statusHub = new StatusHubService();
            const result: boolean[] = [];
            const testSubscription = statusHub.busy$.pipe(distinctUntilChanged()).subscribe((ev) => {
                result.push(ev);
            });
            const statusService = new StatusService(statusHub);

            const subscription = statusService.subscribeToCommand(command);
            command.trigger();

            await firstValueFrom(statusHub.status$.pipe(first((s) => s.busy)));

            subscription.unsubscribe();

            testSubscription.unsubscribe();
            expect(result).toEqual([false, true, false]);
        }, 100);

        it('should not throw when calling subscribeToCommand multiple times while it is already been triggered and busy', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);
            const errors = [];
            command.error$.subscribe((e) => errors.push(e));

            const statusHub = new StatusHubService();
            const statusService = new StatusService(statusHub);

            const subscription1 = statusService.subscribeToCommand(command);
            const subscription2 = statusService.subscribeToCommand(command);

            command.trigger();

            await firstValueFrom(statusHub.status$.pipe(first((s) => s.busy)));
            command.cancel();

            subscription1.unsubscribe();
            expect(() => subscription2.unsubscribe()).not.toThrow();
        }, 100);

        it('should receive error$ when beforeExecuteHandler throws', async () => {
            const expectedError = new Error('beforeExecuteHandler');
            const command = LegacyCommand.create(() => {}, {
                beforeExecuteHandler: () => {
                    throw expectedError;
                },
            });

            const statusHub = new StatusHubService();
            const statusErrors = [];
            jest.spyOn(statusHub, 'register')
                .mockImplementation((observable) =>
                    observable.subscribe((n) => {
                        if (n.error && statusErrors.at(-1) !== n.error) {
                            statusErrors.push(n.error);
                        }
                    }),
                )
                .mockName('statusHub.register()');
            const statusService = new StatusService(statusHub);

            statusService.subscribeToCommand(command);
            command.trigger();

            await firstValueFrom(timer(2));

            expect(statusErrors).toEqual([expectedError]);
        });

        it('should resubscribe after cancel', async () => {
            const completionSubject = new Subject<void>();
            const handler = jest.fn(() => completionSubject.pipe(take(1))).mockName('command-handler');
            const command = LegacyCommand.create(handler);
            const statusHub = new StatusHubService();
            const statusService = new StatusService(statusHub);

            const busyHistory = [];
            statusHub.busy$.pipe(distinctUntilChanged()).subscribe((busy) => busyHistory.push(busy));

            const subscription1 = statusService.subscribeToCommand(command);

            command.trigger();

            await firstValueFrom(statusHub.status$.pipe(first((s) => s.busy)));
            command.cancel();

            await firstValueFrom(statusHub.status$.pipe(first((s) => !s.busy)));

            command.trigger();

            await firstValueFrom(statusHub.status$.pipe(first((s) => s.busy)));

            subscription1.unsubscribe();

            expect(busyHistory).toEqual([false, true, false, true, false]);
        }, 100);
    });

    describe('registerListViewSource$', () => {
        it('should emit final status to statusHub when unsubscribing from listviewsource observable', async () => {
            const resultSubject = new Subject<IListResult<any>>();
            const statusHub = new StatusHubService();
            const result: boolean[] = [];
            const testSubscription = statusHub.busy$.pipe(distinctUntilChanged()).subscribe((ev) => {
                result.push(ev);
            });
            const statusService = new StatusService(statusHub);

            const listViewSource = new ListViewSource<any>((_) => {
                return resultSubject;
            });

            const listViewSource$ = statusService.registerListViewSource$(listViewSource);

            const statusSubscription = listViewSource$.subscribe();

            (listViewSource as any).fetchData({}).subscribe();

            statusSubscription.unsubscribe();

            expect(result).toEqual([false, true, false]);
            testSubscription.unsubscribe();
        }, 100);
    });
});
