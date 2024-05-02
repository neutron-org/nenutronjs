import cosmosclient from '@cosmos-client/core';

global.WebSocket = require('ws');

export const waitSeconds = async (seconds: number) =>
  new Promise((r) => {
    setTimeout(() => r(true), 1000 * seconds);
  });

export class BlockWaiter {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  waitBlocks(n: number, timeout = 120000): Promise<void> {
    // const socket = new StreamingSocket(wsUrl + path, 3000);
    // socket.connect();
    // socket.events.subscribe();

    return new Promise((resolve, reject) => {
      let ws = null;
      const x = setTimeout(() => {
        if (ws != null) {
          ws.unsubscribe();
        }
        reject(new Error('waitBlocks: timeout'));
      }, timeout);
      ws = cosmosclient.websocket.connect(this.url);
      ws.next({
        id: '1',
        jsonrpc: '2.0',
        method: 'subscribe',
        params: ["tm.event='NewBlock'"],
      });
      ws.subscribe((res: cosmosclient.websocket.ResponseSchema) => {
        if (Object.entries(res.result).length !== 0) {
          n--;
          if (n == 0) {
            ws.unsubscribe();
            clearTimeout(x);
            resolve();
          }
        }
      });
    });
  }
}

/**
 * getWithAttempts waits until readyFunc(getFunc()) returns true
 * and only then returns result of getFunc()
 */
export const getWithAttempts = async <T>(
  blockWaiter: BlockWaiter,
  getFunc: () => Promise<T>,
  readyFunc: (t: T) => Promise<boolean>,
  numAttempts = 20,
): Promise<T> => {
  let error = null;
  let data: T;
  while (numAttempts > 0) {
    numAttempts--;
    try {
      data = await getFunc();
      if (await readyFunc(data)) {
        return data;
      }
    } catch (e) {
      error = e;
    }
    await blockWaiter.waitBlocks(1);
  }
  throw error != null
    ? error
    : new Error(
        'getWithAttempts: no attempts left. Latest get response: ' +
          (data === Object(data) ? JSON.stringify(data) : data).toString(),
      );
};
