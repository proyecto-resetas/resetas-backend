import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Obtener las notificaciones del usuario autenticado',
  })
  async findMyNotifications(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ) {
    const userId = req.user.sub;
    return this.notificationsService.findByUser(userId, page, limit);
  }

  @Get('unread-count')
  @Auth()
  @ApiOperation({
    summary: 'Obtener el conteo de notificaciones no leídas',
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.sub;
    const unreadCount = await this.notificationsService.countUnread(userId);
    return { unreadCount };
  }

  @Patch('read-all')
  @Auth()
  @ApiOperation({
    summary: 'Marcar todas las notificaciones del usuario como leídas',
  })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @Auth()
  @ApiOperation({
    summary: 'Marcar una notificación específica como leída',
  })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(userId, id);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: 'Eliminar una notificación',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.remove(userId, id);
  }

  @Post('push-token')
  @Auth()
  @ApiOperation({
    summary: 'Registrar token de dispositivo para Notificaciones Push (FCM)',
  })
  async registerPushToken(
    @Body() dto: RegisterPushTokenDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.notificationsService.registerPushToken(userId, dto.token);
  }

  @Delete('push-token/:token')
  @Auth()
  @ApiOperation({
    summary: 'Eliminar token de dispositivo para Notificaciones Push',
  })
  async unregisterPushToken(
    @Param('token') token: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.notificationsService.unregisterPushToken(userId, token);
  }

  @Post('test')
  @Auth()
  @ApiOperation({
    summary:
      'Enviar una notificación de prueba en tiempo real (WebSocket + Push)',
  })
  async sendTestNotification(@Request() req: any) {
    const userId = req.user.sub;
    const username = req.user.username || 'Chef';
    return this.notificationsService.createAndEmit({
      recipientId: userId,
      senderId: userId,
      senderUsername: username,
      type: 'recipe_sold',
      title: '¡Notificación en tiempo real activa!',
      message: `Hola @${username}, tu conexión WebSocket y Push en Recetarium funciona perfectamente.`,
    });
  }
}
