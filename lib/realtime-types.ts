export type MessageType =
  | 'sync'
  | 'sync:tasks'
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'task:move'
  | 'column:create'
  | 'column:update'
  | 'column:delete';

export interface WSMessage {
  type: MessageType;
  payload: any;
  clientId?: string;
  timestamp?: number;
}
