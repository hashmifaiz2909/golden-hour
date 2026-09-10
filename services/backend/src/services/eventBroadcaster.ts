import { Response } from 'express';

export type EventType = 
  | 'ALERT_CREATED'
  | 'ALERT_STATUS_UPDATED'
  | 'NOTIFICATION_SENT'
  | 'SENSOR_TELEMETRY';

export interface ServerEvent {
  type: EventType;
  timestamp: string;
  data: any;
}

class EventBroadcaster {
  private sseClients: Set<Response> = new Set();

  /**
   * Registers a client for Server-Sent Events
   */
  addClient(res: Response): void {
    this.sseClients.add(res);

    // Initial heartbeat
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString(), clientCount: this.sseClients.size })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  /**
   * Broadcasts an event to all active SSE subscribers
   */
  broadcast(type: EventType, data: any): void {
    const payload: ServerEvent = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    const message = `data: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.sseClients) {
      try {
        client.write(message);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
  }
}

export const eventBroadcaster = new EventBroadcaster();
