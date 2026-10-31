import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationType,
} from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { PushNotificationService } from './push-notification.service';

export interface CreateNotificationInput {
  recipientId: string;
  senderId?: string;
  senderUsername?: string;
  type: NotificationType;
  title: string;
  message: string;
  recipeId?: string;
  recipeName?: string;
  recipeImage?: string;
  amount?: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly gateway: NotificationsGateway,
    private readonly pushService: PushNotificationService,
  ) {}

  async createAndEmit(input: CreateNotificationInput): Promise<Notification> {
    const doc = new this.notificationModel({
      recipientId: new Types.ObjectId(input.recipientId),
      senderId: input.senderId
        ? new Types.ObjectId(input.senderId)
        : undefined,
      senderUsername: input.senderUsername,
      type: input.type,
      title: input.title,
      message: input.message,
      recipeId: input.recipeId,
      recipeName: input.recipeName,
      recipeImage: input.recipeImage,
      amount: input.amount,
      read: false,
    });

    const saved = await doc.save();
    const unreadCount = await this.countUnread(input.recipientId);

    const payload = {
      ...saved.toObject(),
      id: String(saved._id),
      unreadCount,
    };

    // 1. Emitir en tiempo real por WebSocket
    this.gateway.emitToUser(input.recipientId, 'notification:new', payload);
    this.gateway.emitToUser(input.recipientId, 'notification:unread-count', {
      unreadCount,
    });

    // 2. Enviar Push Notification (FCM / segundo plano)
    await this.pushService.sendToUser(input.recipientId, {
      title: input.title,
      body: input.message,
      imageUrl: input.recipeImage,
      data: {
        notificationId: String(saved._id),
        type: input.type,
        recipeId: input.recipeId || '',
        recipeName: input.recipeName || '',
      },
    });

    return saved;
  }

  async findByUser(userId: string, page = 1, limit = 30) {
    const recipientObjId = new Types.ObjectId(userId);
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ recipientId: recipientObjId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.notificationModel
        .countDocuments({ recipientId: recipientObjId })
        .exec(),
      this.countUnread(userId),
    ]);

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({
        recipientId: new Types.ObjectId(userId),
        read: false,
      })
      .exec();
  }

  async markAsRead(userId: string, notificationId: string) {
    const updated = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(notificationId),
          recipientId: new Types.ObjectId(userId),
        },
        { $set: { read: true } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Notification not found');
    }

    const unreadCount = await this.countUnread(userId);
    this.gateway.emitToUser(userId, 'notification:unread-count', {
      unreadCount,
    });

    return {
      notification: updated,
      unreadCount,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel
      .updateMany(
        {
          recipientId: new Types.ObjectId(userId),
          read: false,
        },
        { $set: { read: true } },
      )
      .exec();

    this.gateway.emitToUser(userId, 'notification:unread-count', {
      unreadCount: 0,
    });

    return {
      message: 'All notifications marked as read',
      unreadCount: 0,
    };
  }

  async remove(userId: string, notificationId: string) {
    await this.notificationModel
      .findOneAndDelete({
        _id: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(userId),
      })
      .exec();

    const unreadCount = await this.countUnread(userId);
    this.gateway.emitToUser(userId, 'notification:unread-count', {
      unreadCount,
    });

    return {
      message: 'Notification deleted',
      unreadCount,
    };
  }

  async registerPushToken(userId: string, token: string) {
    await this.pushService.registerToken(userId, token);
    return {
      success: true,
      message: 'Push token registered successfully',
    };
  }

  async unregisterPushToken(userId: string, token: string) {
    await this.pushService.unregisterToken(userId, token);
    return {
      success: true,
      message: 'Push token removed successfully',
    };
  }
}
