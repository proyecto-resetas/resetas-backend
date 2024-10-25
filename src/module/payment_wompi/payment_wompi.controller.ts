import { Controller, Post, Body, } from '@nestjs/common';
import { PaymentWompiService } from './payment_wompi.service';
import { CreatePaymentWompiDto } from './dto/create-payment_wompi.dto';
import { UpdatePaymentWompiDto } from './dto/update-payment_wompi.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('paymentWompi')
@Controller('payment-wompi')
export class PaymentWompiController {
  constructor(private readonly paymentWompiService: PaymentWompiService) {}

  @Post()
  create(@Body() createPaymentWompiDto: CreatePaymentWompiDto) {
    return this.paymentWompiService.create(createPaymentWompiDto);
  }

}
