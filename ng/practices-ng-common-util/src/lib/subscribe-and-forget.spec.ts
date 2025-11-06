import { describe, expect, it, jest } from '@jest/globals';
import { subscribeAndForget } from './subscribe-and-forget';
import { Observable } from 'rxjs';

describe('subscribeAndForget', () => {
  it('should subscribe to the observable', () => {
    const mockSubscribe = jest.fn();
    const mockObservable = {
      subscribe: mockSubscribe
    } as unknown as Observable<unknown>;

    subscribeAndForget(mockObservable);

    expect(mockSubscribe).toHaveBeenCalled();
  });
});
