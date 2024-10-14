import { Module } from '@nestjs/common';
import { PaymentWompiService } from './payment_wompi.service';
import { PaymentWompiController } from './payment_wompi.controller';

@Module({
  controllers: [PaymentWompiController],
  providers: [PaymentWompiService],
})
export class PaymentWompiModule {}
