import { Controller, Post, Body, Get, } from '@nestjs/common';
import { PaymentWompiService } from './payment_wompi.service';
import { CreatePaymentWompiDto } from './dto/create-payment_wompi.dto';
import { UpdatePaymentWompiDto } from './dto/update-payment_wompi.dto';
import { ApiTags } from '@nestjs/swagger';
import { TokenCardDto } from './dto/token-card.dto';

@ApiTags('paymentWompi')
@Controller('payment-wompi')
export class PaymentWompiController {
  constructor(private readonly paymentWompiService: PaymentWompiService) {}

  @Post('pay')
  async makePayment(@Body() paymentDto: { amount: number, userPaymentSourceId: string, destinationAccount: string, appAccount: string }) {
    return await this.paymentWompiService.processTransaction(paymentDto.amount, paymentDto.userPaymentSourceId, paymentDto.destinationAccount, paymentDto.appAccount);
  }

  @Post('unlock-product')
  async unlockProduct(@Body() unlockDto: { productId: string, userId: string }) {
    return await this.paymentWompiService.unlockProduct(unlockDto.productId, unlockDto.userId);
  }

  @Post('token-card')
  async getTokenCard(@Body() tokenCardDto: TokenCardDto ){
    const token = await this.paymentWompiService.getTokenCard(tokenCardDto.number, tokenCardDto.cvc, tokenCardDto.expMonth, tokenCardDto.expYear, tokenCardDto.cardHolder)
    const {id} = token.data
   console.log(token.data.id);
   
    return id;
  }

  @Get('getMerchats')
  async getMerchats(){
    const token = await this.paymentWompiService.getMerchant()
   
    const presigned_acceptance = token.data.presigned_acceptance
    const presigned_personal_data_auth = token.data.presigned_personal_data_auth
    return {
      presigned_acceptance,
      presigned_personal_data_auth
    }
  }
}
