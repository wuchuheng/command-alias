import { ipcMain, ipcRenderer } from 'electron';

export type IpcChannel<RequestType, ResponseType> = {
  request: (data: RequestType) => Promise<ResponseType>;
  handle: (handler: (data: RequestType) => Promise<ResponseType>) => void;
};
/**
 * Creates a bidirectional IPC channel for request-response and event-based communication
 * @param channelName The base channel name for this communication
 * @returns Object with request and handle methods for bidirectional communication
 */
export const createIpcChannel = <RequestType, ResponseType>(
  channelName: string
): IpcChannel<RequestType, ResponseType> => {
  return {
    request: async (data: RequestType) => {
      return ipcRenderer.invoke(channelName, data);
    },
    handle: async (handler: (data: RequestType) => Promise<ResponseType>) => {
      ipcMain.handle(channelName, async (event, data: RequestType) => {
        return handler(data);
      });
    },
  };
};
