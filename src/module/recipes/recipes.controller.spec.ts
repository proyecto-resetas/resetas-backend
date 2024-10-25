import { Test, TestingModule } from '@nestjs/testing';
import { RecetasController } from './recipes.controller';
import { RecetasService } from './recipes.service';

describe('RecetasController', () => {
  let controller: RecetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetasController],
      providers: [RecetasService],
    }).compile();

    controller = module.get<RecetasController>(RecetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
