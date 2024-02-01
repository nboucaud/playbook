import type { ServiceProvider, TypesToDeps } from '../di';
import {
  createIdentifier,
  dependenciesToFactory,
  SuperServiceProvider,
} from '../di';
import type { CleanupService } from '../lifecycle';

export interface EventBus {
  register(eventHandler: EventHandler<any>): () => void;
  emit<T>(event: Event<T>, payload: T): void;
}

/**
 * @example
 * ```ts
 * // define a event
 * const SomeEvent = createEvent<{ data: number }>("someThing");
 *
 * // create a event handler
 * const SomeEventHandler = createEventHandler(
 *   SomeEvent,
 *   (payload, otherService: OtherService) => {
 *     expect(payload.data).toBe(1);
 *   },
 *   [OtherService]
 * // ^ dependencies
 * );
 *
 * // register both to service collection
 * const services = new ServiceCollection();
 * services.add(EventService, [[EventHandler], ServiceProvider]);
 * services.addImpl(EventHandler('test'), SomeEventHandler);
 * //                            ^ unique name to deduplicate
 *
 * // emit event
 * const provider = services.provider();
 * const eventService = provider.get(EventService);
 * eventService.emit(SomeEvent, { data: 1 });
 * ```
 *
 * # with scope
 *
 * The events triggered will be broadcast globally, not just in the current scope. Handlers in the same scope can also
 * listen to global events, and when the scope is destroyed, the handlers in the scope will also stop listening.
 */
export const EventBus = createIdentifier<EventBus>('EventBus');

export class GlobalEventService implements EventBus {
  listeners: Map<
    string,
    Set<(payload: any, serviceProvider: ServiceProvider) => void>
  > = new Map();

  constructor(
    eventHandlers: EventHandler<any>[],
    private readonly provider: ServiceProvider
  ) {
    for (const eventHandler of eventHandlers) {
      this.register(eventHandler);
    }
  }

  register(eventHandler: EventHandler<any>) {
    const listeners = this.listeners.get(eventHandler.event.name) ?? new Set();
    listeners.add(eventHandler.cb);
    this.listeners.set(eventHandler.event.name, listeners);
    return () => {
      this.listeners.get(eventHandler.event.name)?.delete(eventHandler.cb);
    };
  }

  emit<T>(event: Event<T>, payload: T) {
    const listeners = this.listeners.get(event.name);
    if (listeners) {
      listeners.forEach(listener => listener(payload, this.provider));
    }
  }
}

export class ScopeEventService implements EventBus {
  listeners = new Set<() => void>();
  superEventBus: EventBus;
  constructor(
    eventHandlers: EventHandler<any>[],
    cleanupService: CleanupService,
    private readonly provider: ServiceProvider
  ) {
    this.superEventBus = provider.get(SuperServiceProvider).get(EventBus);
    for (const eventHandler of eventHandlers) {
      this.register(eventHandler);
    }

    cleanupService.add(() => {
      this.listeners.forEach(listener => listener());
      this.listeners.clear();
    });
  }

  register(eventHandler: EventHandler<any>): () => void {
    const unsub = this.superEventBus.register({
      event: eventHandler.event,
      cb: (payload, _) => {
        eventHandler.cb(payload, this.provider);
      },
    });

    this.listeners.add(unsub);

    return () => {
      unsub();
      this.listeners.delete(unsub);
    };
  }

  emit<T>(event: Event<T>, payload: T): void {
    this.superEventBus.emit(event, payload);
  }
}

export interface Event<T> {
  name: string;
  type: T;
}

export interface EventHandler<T> {
  event: Event<T>;
  cb: (payload: T, provider: ServiceProvider) => void;
}

export const EventHandler = createIdentifier<EventHandler<any>>('EventHandler');

export function createEvent<T>(name: string): Event<T> {
  return {
    name: name,
    type: null as T,
  };
}

export function createEventHandler<
  E extends Event<any>,
  Callback extends (payload: E['type'], ...args: any[]) => void,
  DepsArgs extends any[] = Parameters<Callback> extends [
    any,
    infer Dep1,
    ...infer Deps,
  ]
    ? [Dep1, ...Deps]
    : [],
  Deps = DepsArgs extends [] ? [] : TypesToDeps<DepsArgs>,
>(
  event: E,
  cb: Callback,
  ...deps: Deps extends [] ? [] : [Deps]
): EventHandler<E['type']> {
  return {
    event,
    cb: (payload, provider) => {
      dependenciesToFactory(
        (...args: any[]) => {
          cb(payload, ...args);
        },
        (deps ?? [])[0] as any
      )(provider);
    },
  };
}
