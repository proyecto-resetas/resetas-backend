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
      throw new Error(
        'BREVO_API_KEY no está configurada en las variables de entorno',
      );
    }
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const {
      to,
      subject,
      htmlContent,
      senderName = 'Recetarium',
      senderEmail = process.env.BREVO_SENDER_EMAIL ||
        'danielestebanjimenezlopez@gmail.com',
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
      console.error(
        'Error al enviar email con Brevo:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('No se pudo enviar el email');
    }
  }

  async sendOtpEmail(email: string, code: string): Promise<void> {
    const htmlContent = `
     <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Importamos una fuente más moderna */
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

            body {
              font-family: 'Poppins', Arial, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
              color: #333;
            }

            .wrapper {
              width: 100%;
              table-layout: fixed;
              background-color: #f8f9fa;
              padding-bottom: 40px;
            }

            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            }

            .header {
              background-color: #FF9800; /* Color del logo */
              padding: 40px 20px;
              text-align: center;
            }

            .logo {
              max-width: 250px;
              height: auto;
            }

            .content {
              padding: 40px 30px;
              text-align: center;
            }

            h2 {
              color: #1a1a1a;
              font-size: 24px;
              margin-bottom: 10px;
            }

            p {
              color: #666;
              line-height: 1.6;
              font-size: 16px;
            }

            .otp-container {
              margin: 30px 0;
              padding: 20px;
              background-color: #FFF3E0;
              border: 2px dashed #FF9800;
              border-radius: 16px;
            }

            .otp-code {
              font-size: 42px;
              font-weight: 700;
              color: #000;
              letter-spacing: 8px;
              margin: 0;
            }

            .footer {
              text-align: center;
              padding: 30px;
              background-color: #1a1a1a;
              color: #ffffff;
              font-size: 13px;
            }

            .footer p {
              color: #bbb;
              margin: 5px 0;
            }

            .validity-note {
              font-size: 14px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img href="./assets/images/recetariumBorderDart.png" alt="Recetarium" class="logo">
              </div>

              <div class="content">
                <h2>¡Hola! 👨‍🍳</h2>
                <p>Has solicitado un código de verificación para acceder a tu cuenta en <strong>Recetarium</strong>.</p>
                
                <div class="otp-container">
                  <p style="margin-top: 0; font-weight: 600; color: #FF9800;">TU CÓDIGO DE SEGURIDAD</p>
                  <div class="otp-code">${code}</div>
                </div>

                <p class="validity-note">Este código expirará en <strong>10 minutos</strong> por seguridad.</p>
                <p style="font-size: 14px;">Si no has solicitado este código, puedes ignorar este correo de forma segura.</p>
              </div>

              <div class="footer">
                <p><strong>Recetarium</strong> - Tu cocina, tus reglas.</p>
                <p>© 2026 Todos los derechos reservados.</p>
              </div>
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
