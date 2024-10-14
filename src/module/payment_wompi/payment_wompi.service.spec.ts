import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWompiService } from './payment_wompi.service';

describe('PaymentWompiService', () => {
  let service: PaymentWompiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentWompiService],
    }).compile();

    service = module.get<PaymentWompiService>(PaymentWompiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
