import { Injectable } from '@nestjs/common';
import { CreatePaymentWompiDto } from './dto/create-payment_wompi.dto';
import { UpdatePaymentWompiDto } from './dto/update-payment_wompi.dto';

@Injectable()
export class PaymentWompiService {
  create(createPaymentWompiDto: CreatePaymentWompiDto) {
    return 'This action adds a new paymentWompi';
  }


}
