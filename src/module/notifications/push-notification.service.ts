import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';

export interface PushPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private isFirebaseInitialized = false;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (admin.apps.length > 0) {
        this.isFirebaseInitialized = true;
        return;
      }

      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );

      if (serviceAccountJson) {
        const credentials = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
        this.isFirebaseInitialized = true;
        this.logger.log(
          'Firebase Admin inicializado mediante FIREBASE_SERVICE_ACCOUNT_JSON',
        );
      } else if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.isFirebaseInitialized = true;
        this.logger.log(
          `Firebase Admin inicializado para el proyecto: ${projectId}`,
        );
      } else {
        this.logger.warn(
          'Credenciales de Firebase no detectadas en variables de entorno. El envío de Push Notifications operará en modo simulado/WebSocket hasta configurar FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error inicializando Firebase Admin: ${error.message}`,
      );
    }
  }

  async registerToken(userId: string, token: string): Promise<void> {
    if (!token || !token.trim()) return;
    await this.userModel
      .findByIdAndUpdate(userId, {
        $addToSet: { fcmTokens: token.trim() },
      })
      .exec();
  }

  async unregisterToken(userId: string, token: string): Promise<void> {
    if (!token || !token.trim()) return;
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { fcmTokens: token.trim() },
      })
      .exec();
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('fcmTokens')
        .exec();

      const tokens = (user?.fcmTokens || []).filter(
        (t) => t && !t.startsWith('local_device_'),
      );

      if (tokens.length === 0 || !this.isFirebaseInitialized) {
        return;
      }

      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'recetarium_high_importance_channel',
            color: '#F26625',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });

      // Limpiar tokens expirados o dados de baja
      const invalidTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const code = res.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await this.userModel
          .findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { $in: invalidTokens } },
          })
          .exec();
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar push notification al usuario ${userId}: ${error.message}`,
      );
    }
  }
}
