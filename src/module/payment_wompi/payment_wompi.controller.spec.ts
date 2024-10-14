import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWompiController } from './payment_wompi.controller';
import { PaymentWompiService } from './payment_wompi.service';

describe('PaymentWompiController', () => {
  let controller: PaymentWompiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentWompiController],
      providers: [PaymentWompiService],
    }).compile();

    controller = module.get<PaymentWompiController>(PaymentWompiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
