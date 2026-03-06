import { Test, TestingModule } from '@nestjs/testing';
import { TypeScheController } from './type_sche.controller';

describe('TypeScheController', () => {
  let controller: TypeScheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeScheController],
    }).compile();

    controller = module.get<TypeScheController>(TypeScheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
