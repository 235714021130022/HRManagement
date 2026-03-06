import { Test, TestingModule } from '@nestjs/testing';
import { TypescheLinkController } from './typesche_link.controller';

describe('TypescheLinkController', () => {
  let controller: TypescheLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypescheLinkController],
    }).compile();

    controller = module.get<TypescheLinkController>(TypescheLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
