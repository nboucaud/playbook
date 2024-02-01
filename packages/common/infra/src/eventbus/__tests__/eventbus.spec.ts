import { describe, expect, test } from 'vitest';

import { createScope, ServiceCollection, ServiceProvider } from '../../di';
import { CleanupService } from '../../lifecycle';
import {
  createEvent,
  createEventHandler,
  EventBus,
  EventHandler,
  GlobalEventService,
  ScopeEventService,
} from '..';

describe('Event', () => {
  test('basic', async () => {
    class TestService {
      name = 'test';
    }

    const aEvent = createEvent<{ hello: string }>('a');
    let world = '';

    const aEventHandler = createEventHandler(
      aEvent,
      (payload, test: TestService) => {
        world = `${payload.hello} ${test.name}`;
      },
      [TestService]
    );

    const services = new ServiceCollection();

    services
      .addImpl(EventBus, GlobalEventService, [[EventHandler], ServiceProvider])
      .add(TestService)
      .addImpl(EventHandler('test'), aEventHandler);

    const provider = services.provider();

    const eventBus = provider.get(EventBus);

    eventBus.emit(aEvent, { hello: 'world' });

    expect(world).toBe('world test');
  });

  test('scope', async () => {
    const SomeEvent = createEvent<string>('some-event');
    let payload1 = '';

    const aEventHandler = createEventHandler(SomeEvent, payload => {
      payload1 = payload;
    });

    let payload2 = '';
    const bEventHandler = createEventHandler(SomeEvent, payload => {
      payload2 = payload;
    });

    const scope1 = createScope('scope1');
    const services = new ServiceCollection();

    services
      .addImpl(EventBus, GlobalEventService, [[EventHandler], ServiceProvider])
      .addImpl(EventHandler('a'), aEventHandler)
      .scope(scope1)
      .addImpl(EventBus, ScopeEventService, [
        [EventHandler],
        CleanupService,
        ServiceProvider,
      ])
      .add(CleanupService)
      .addImpl(EventHandler('b'), bEventHandler);

    const provider = services.provider();
    const scopeProvider = services.provider(scope1, provider);

    const rootEventBus = provider.get(EventBus);
    const scopeEventBus = scopeProvider.get(EventBus);

    rootEventBus.emit(SomeEvent, 'hello');
    expect(payload1).toBe('hello');
    expect(payload2).toBe('hello');

    scopeEventBus.emit(SomeEvent, 'world');
    expect(payload1).toBe('world');
    expect(payload2).toBe('world');

    scopeProvider.get(CleanupService).cleanup();

    rootEventBus.emit(SomeEvent, 'hello');
    expect(payload1).toBe('hello');
    expect(payload2).toBe('world');
  });
});
