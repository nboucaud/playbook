import { DebugLogger } from '@affine/debug';
import { Unreachable } from '@affine/env/constant';
import { type OperatorFunction, Subject } from 'rxjs';

const logger = new DebugLogger('effect');

export type Effect<T> = (T | undefined extends T // hack to detect if T is unknown
  ? () => void
  : (value: T) => void) & {
  // unsubscribe effect, all ongoing effects will be cancelled.
  unsubscribe: () => void;
};

export function effect<T, A>(op1: OperatorFunction<T, A>): Effect<T>;
export function effect<T, A, B>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>
): Effect<T>;
export function effect<T, A, B, C>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>
): Effect<T>;
export function effect<T, A, B, C, D>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>
): Effect<T>;
export function effect<T, A, B, C, D, E>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>
): Effect<T>;
export function effect<T, A, B, C, D, E, F>(
  op1: OperatorFunction<T, A>,
  op2: OperatorFunction<A, B>,
  op3: OperatorFunction<B, C>,
  op4: OperatorFunction<C, D>,
  op5: OperatorFunction<D, E>,
  op6: OperatorFunction<E, F>
): Effect<T>;
export function effect(...args: any[]) {
  const subject$ = new Subject<any>();

  const effectLocation = environment.isDebug
    ? `(${new Error().stack?.split('\n')[2].trim()})`
    : '';

  class EffectError extends Unreachable {
    constructor(message: string, value?: any) {
      logger.error(`effect ${effectLocation} ${message}`, value);
      super(
        `effect ${effectLocation} ${message}` +
          ` ${value ? (value instanceof Error ? value.stack ?? value.message : value + '') : ''}`
      );
    }
  }

  // eslint-disable-next-line prefer-spread
  const subscription = subject$.pipe.apply(subject$, args as any).subscribe({
    next(value) {
      const error = new EffectError('should not emit value', value);
      setImmediate(() => {
        throw error;
      });
    },
    complete() {
      const error = new EffectError('effect unexpected complete');
      setImmediate(() => {
        throw error;
      });
    },
    error(error) {
      const effectError = new EffectError('effect uncaught error', error);
      setImmediate(() => {
        throw effectError;
      });
    },
  });

  const fn = (value: unknown) => {
    subject$.next(value);
  };

  fn.unsubscribe = () => subscription.unsubscribe();

  return fn as never;
}
