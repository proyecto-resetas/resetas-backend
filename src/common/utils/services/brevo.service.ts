import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  senderName?: string;
  senderEmail?: string;
}

@Injectable()
export class BrevoService {
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY no está configurada en las variables de entorno');
    }
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const {
      to,
      subject,
      htmlContent,
      senderName = 'Resetas',
      senderEmail = process.env.BREVO_SENDER_EMAIL || 'danielestebanjimenezlopez@gmail.com',
    } = params;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: to,
            },
          ],
          subject,
          htmlContent,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 201) {
        throw new InternalServerErrorException('Error al enviar el email');
      }
    } catch (error) {
      console.error('Error al enviar email con Brevo:', error.response?.data || error.message);
      throw new InternalServerErrorException('No se pudo enviar el email');
    }
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 50px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
            }
            .header h1 {
              color: #ff6b6b;
              margin: 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #ff6b6b;
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍳 Resetas</h1>
            </div>
            <div class="content">
              <h2>Código de Verificación</h2>
              <p>Has solicitado un código de verificación para tu cuenta.</p>
              <p>Utiliza el siguiente código:</p>
              <div class="otp-code">${code}</div>
              <p>Este código es válido por 10 minutos.</p>
              <p>Si no solicitaste este código, por favor ignora este mensaje.</p>
            </div>
            <div class="footer">
              <p>© 2025 Resetas. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Código de Verificación - Resetas',
      htmlContent,
    });
  }
}





