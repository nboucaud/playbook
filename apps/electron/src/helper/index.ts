import type { EventBasedChannel } from 'async-call-rpc';
import { AsyncCall } from 'async-call-rpc';

import { events, handlers } from './exposed';
import { logger } from './logger';

const createMessagePortMainChannel = (
  connection: Electron.MessagePortMain
): EventBasedChannel => {
  return {
    on(listener) {
      const f = (e: Electron.MessageEvent) => {
        listener(e.data);
      };
      connection.on('message', f);
      // MUST start the connection to receive messages
      connection.start();
      return () => {
        connection.off('message', f);
      };
    },
    send(data) {
      connection.postMessage(data);
    },
  };
};

function setupRendererConnection(rendererPort: Electron.MessagePortMain) {
  const flattenedHandlers = Object.entries(handlers).flatMap(
    ([namespace, namespaceHandlers]) => {
      return Object.entries(namespaceHandlers).map(([name, handler]) => {
        return [`${namespace}:${name}`, handler];
      });
    }
  );
  const rpc = AsyncCall<PeersAPIs.RendererToHelper>(
    Object.fromEntries(flattenedHandlers),
    {
      channel: createMessagePortMainChannel(rendererPort),
      log: false,
    }
  );

  for (const [namespace, namespaceEvents] of Object.entries(events)) {
    for (const [key, eventRegister] of Object.entries(namespaceEvents)) {
      const subscription = eventRegister((...args: any[]) => {
        const chan = `${namespace}:${key}`;
        rpc.postEvent(chan, ...args);
      });
      process.on('exit', () => {
        subscription();
      });
    }
  }
}

function main() {
  process.parentPort.on('message', e => {
    if (e.data.channel === 'renderer-connect' && e.ports.length === 1) {
      const rendererPort = e.ports[0];
      setupRendererConnection(rendererPort);
      logger.info('[helper] renderer connected');
    }
  });
}

main();
