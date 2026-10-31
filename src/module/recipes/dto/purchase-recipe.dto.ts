import { IsEmail, IsOptional, IsString } from '@nestjs/class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseRecipeDto {
  @ApiPropertyOptional({
    description:
      'Referencia o ID de transacción del pago (opcional, preparado para escalar con pasarela de pagos)',
    example: 'tx_123456789',
  })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({
    description:
      'Email del destinatario (reservado para futuro flujo de regalar receta a un amigo)',
    example: 'amigo@ejemplo.com',
  })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;
}
