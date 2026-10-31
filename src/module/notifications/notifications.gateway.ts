import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = this.extractUserIdFromSocket(client);
      if (!userId) {
        this.logger.debug(
          `Cliente ${client.id} conectado sin token inicial (esperando evento subscribe)`,
        );
        return;
      }

      client.data.userId = userId;
      await client.join(this.getUserRoom(userId));
      this.logger.log(
        `Usuario ${userId} conectado al WebSocket de notificaciones (${client.id})`,
      );
      client.emit('notification:connected', {
        status: 'connected',
        userId,
      });
    } catch (error) {
      this.logger.warn(
        `Error autenticando conexión WebSocket (${client.id}): ${error.message}`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.logger.log(
        `Usuario ${userId} desconectado del WebSocket (${client.id})`,
      );
    }
  }

  @SubscribeMessage('notification:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string; token?: string },
  ) {
    let userId = payload?.userId;
    if (payload?.token) {
      const decoded = this.verifyToken(payload.token);
      if (decoded?.sub) {
        userId = decoded.sub;
      }
    }

    if (userId) {
      client.data.userId = userId;
      await client.join(this.getUserRoom(userId));
      return { event: 'notification:subscribed', data: { userId } };
    }
    return { event: 'notification:error', data: { message: 'Unauthorized' } };
  }

  emitToUser(userId: string, event: string, data: any) {
    if (!this.server || !userId) return;
    this.server.to(this.getUserRoom(userId)).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    if (!this.server) return;
    this.server.emit(event, data);
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  private extractUserIdFromSocket(client: Socket): string | null {
    const authToken =
      client.handshake?.auth?.token ||
      client.handshake?.query?.token ||
      client.handshake?.headers?.authorization;

    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      const cleanToken = authToken.replace(/^Bearer\s+/i, '').trim();
      const decoded = this.verifyToken(cleanToken);
      if (decoded?.sub) {
        return String(decoded.sub);
      }
    }

    const queryUserId =
      client.handshake?.auth?.userId || client.handshake?.query?.userId;
    if (typeof queryUserId === 'string' && queryUserId.trim().length > 0) {
      return queryUserId.trim();
    }

    return null;
  }

  private verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      try {
        return this.jwtService.decode(token);
      } catch {
        return null;
      }
    }
  }
}
