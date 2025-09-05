import { isObjShallowEqual } from '@nexplore/practices-ng-common-util';
import { map, merge, Observable, of, shareReplay, switchMap, timer } from 'rxjs';
import { StatusEventExt, StatusHubConfig } from './model';

export interface StatusMap {
    [key: string]: StatusEventExt;
}

function isStatusSuccessAndContainsMessageOrGenericCategory(s: StatusEventExt): boolean {
    return !!(s.success && (typeof s.success === 'string' || s.statusCategory?.startsWith('action-')));
}

export function getLatestStatusEventsList$(aggregatedStatusMap$: Observable<StatusMap>, config: StatusHubConfig) {
    return aggregatedStatusMap$.pipe(
        map((statusMap) => {
            const now = performance.now();
            const events = Object.values(statusMap)
                .filter(
                    (s) =>
                        (s.error || isStatusSuccessAndContainsMessageOrGenericCategory(s)) &&
                        !s._hasBeenPushedAway &&
                        s.timestamp &&
                        ((s.error && s._isAlreadyVisible) || now - s.timestamp < config.messageEventTimeToLiveMs)
                )
                .sort((a, b) => b.timestamp! - a.timestamp!); // Sort by timestamp

            const pushedAway = events.slice(config.maxVisibleEventCount);
            pushedAway.forEach((s) => {
                s._hasBeenPushedAway = true;
            });

            return events.slice(0, config.maxVisibleEventCount); // Take only latest entries
        }),
        switchMap((events) => {
            events = events.filter((ev, i) => {
                const hasDuplicates = events.some(
                    (ev2, i2) =>
                        i2 !== i &&
                        !ev2._hasBeenPushedAway &&
                        isObjShallowEqual(
                            ev,
                            ev2,
                            (key) => !key.startsWith('_') && key !== 'timestamp',
                            config.eventPropertyComparator
                        )
                );

                if (i !== 0 && hasDuplicates) {
                    ev._hasBeenPushedAway = true;
                    return false;
                }
                return true;
            });

            events.forEach((ev) => {
                // If an error is already visible, do not auto hide
                ev._isAlreadyVisible = true;
            });

            const refreshTimestampsForSuccessEvents = events
                .filter((ev) => ev.autohide === true)
                .map((ev) => {
                    const age = performance.now() - ev.timestamp!;
                    const timeUntilAutohide = config.messageEventTimeToLiveMs - age;
                    return timeUntilAutohide;
                });

            if (refreshTimestampsForSuccessEvents.length > 0) {
                return merge(
                    of(events),
                    // filter the expired success messages
                    ...refreshTimestampsForSuccessEvents.map((timeUntilAutohide) =>
                        timer(timeUntilAutohide + 1).pipe(
                            map(() =>
                                events.filter(
                                    (ev) =>
                                        !ev.autohide ||
                                        performance.now() - ev.timestamp! < config.messageEventTimeToLiveMs
                                )
                            )
                        )
                    )
                );
            } else {
                return of(events);
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );
}
