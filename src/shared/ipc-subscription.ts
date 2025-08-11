import { ipcRenderer, WebContents, ipcMain } from 'electron';

type UnsubscribeCallback = () => void;

export type SubscriptCallback<T> = (callback: (data: T) => void) => UnsubscribeCallback;
/**
 * Creates a subscription handler for the renderer process.
 * This function enables renderer processes to subscribe to events from the main process.
 *
 * @param channelName Base channel name for the subscription
 * @returns A function that accepts a callback and returns an unsubscribe function
 */
export const createRendererSubscription = <T>(channelName: string): SubscriptCallback<T> => {
  return (callback: (data: T) => void) => {
    // Channel for receiving broadcasts
    const broadcastChannel = `${channelName}/broadcast`;

    // Set up event listener for incoming data
    ipcRenderer.on(broadcastChannel, (_event, data: T) => {
      callback(data);
    });

    // Send subscription request
    ipcRenderer.send(`${channelName}/subscribe`);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeAllListeners(broadcastChannel);
      ipcRenderer.send(`${channelName}/unsubscribe`);
    };
  };
};

type Broadcaster<T> = {
  broadcast: (data: T) => void;
  getSubscriberCount: () => number;
};
/**
 * Creates a subscription broadcaster for the main process.
 * This function enables the main process to broadcast events to subscribed renderer processes.
 *
 * @param channelName Base channel name for the subscription
 * @returns An object with methods to broadcast data and get subscriber count
 */
export const createMainProcessBroadcaster = <T>(channelName: string): Broadcaster<T> => {
  // Keep track of subscribers
  const subscribers = new Set<WebContents>();

  // Set up subscription handlers
  const setupSubscriptionHandlers = () => {
    // Subscribe handler
    ipcMain.on(`${channelName}/subscribe`, event => {
      subscribers.add(event.sender);

      // Clean up when WebContents is destroyed
      event.sender.on('destroyed', () => {
        subscribers.delete(event.sender);
      });
    });

    // Unsubscribe handler
    ipcMain.on(`${channelName}/unsubscribe`, event => {
      subscribers.delete(event.sender);
    });
  };

  // Broadcast data to all subscribers
  const broadcast = (data: T) => {
    for (const subscriber of subscribers) {
      if (!subscriber.isDestroyed()) {
        subscriber.send(`${channelName}/broadcast`, data);
      } else {
        subscribers.delete(subscriber);
      }
    }
  };

  // Initialize subscription handlers
  setupSubscriptionHandlers();

  return {
    broadcast,
    getSubscriberCount: () => subscribers.size,
  };
};

export type SubscriptionChannel<T> = {
  request: SubscriptCallback<T>;
  server: () => Broadcaster<T>;
};

const createSubscriptionChannel = <T>(channelName: string): SubscriptionChannel<T> => {
  return {
    request: createRendererSubscription<T>(channelName),
    server: () => createMainProcessBroadcaster<T>(channelName),
  };
};

export default createSubscriptionChannel;
