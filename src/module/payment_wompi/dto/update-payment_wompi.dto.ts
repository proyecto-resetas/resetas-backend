import { PartialType } from '@nestjs/swagger';
import { CreatePaymentWompiDto } from './create-payment_wompi.dto';

export class UpdatePaymentWompiDto extends PartialType(CreatePaymentWompiDto) {}
