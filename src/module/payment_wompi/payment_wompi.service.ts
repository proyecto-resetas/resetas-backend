import { Injectable } from '@nestjs/common';
import { CreatePaymentWompiDto } from './dto/create-payment_wompi.dto';
import { UpdatePaymentWompiDto } from './dto/update-payment_wompi.dto';
import axios from 'axios';

@Injectable()
export class PaymentWompiService {
  private wompiUrl = 'https://sandbox.wompi.co/v1'; // Usar URL de producción si es necesario
  private wompiPublicKey = process.env.PUBLIC_KEY_WOMPI;
  private wompiPrivateKey = process.env.PRIVATE_KEY_WOMPI;

  async getMerchant(){
    const acceptanceToken = await axios.get(
      `${this.wompiUrl}/merchants/${this.wompiPublicKey}`
    );

    return acceptanceToken.data;
  }

  async processTransaction(amount: number, userPaymentSourceId: string, destinationAccount: string, appAccount: string) {
    const paymentAmount = amount * 100; // Wompi maneja valores en centavos

  //  const get = await axios.get(
  //   `${this.wompiUrl}/merchants/${this.wompiPublicKey}`
  //  );

    // Transacción entre usuarios
    const transactionResponse = await axios.post(
      `${this.wompiUrl}/transactions`,
      {
        amount_in_cents: paymentAmount,
        currency: 'COP',
        customer_email: 'user@example.com', // Correo del usuario que paga
        payment_method: {
          type: 'CARD',
          token: userPaymentSourceId, // Token generado al registrar tarjeta
        },
        reference: 'unique_txn_id',
        redirect_url: 'https://miapp.com/pagos/completado', // URL de redirección
        destination: {
          account_id: destinationAccount, // ID de la cuenta del destinatario
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.wompiPrivateKey}`,
        },
      }
    );

    // Aplicar la comisión a la cuenta de la aplicación
    const commissionAmount = paymentAmount * 0.10; // Ejemplo: 10% de comisión
    await axios.post(
      `${this.wompiUrl}/transactions`,
      {
        amount_in_cents: commissionAmount,
        currency: 'COP',
        customer_email: 'app@example.com', // Correo del usuario de la app
        payment_method: {
          type: 'DEBIT',
          token: 'app_payment_source_id', // Fuente de pago de la app
        },
        reference: 'app_commission_txn',
        destination: {
          account_id: appAccount, // ID de la cuenta de la aplicación
        }
      },
      {
        headers: {
          Authorization: `Bearer ${this.wompiPrivateKey}`,
        },
      }
    );

    return transactionResponse.data;
  }

  async unlockProduct(productId: string, userId: string) {
    // Lógica para desbloquear el producto (imagen o acceso a más información)
    // Por ejemplo, cambiar un estado en la base de datos para el usuario y producto
  }

  async getTokenCard(number: string, cvc: string, expMonth: string, expYear: string, cardHolder: string){


    const tokenCard = await axios.post(
      `${this.wompiUrl}/tokens/cards`,
      {
        number: number,
        cvc: cvc,
        exp_month: expMonth,
        exp_year: expYear,
        card_holder: cardHolder
      },
      {
        headers: {
          Authorization: `Bearer ${this.wompiPublicKey}`,
        },
      }
    );

    return tokenCard.data;
  }


}

