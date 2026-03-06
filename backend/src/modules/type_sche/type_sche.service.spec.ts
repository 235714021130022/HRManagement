import { Test, TestingModule } from '@nestjs/testing';
import { TypeScheService } from './type_sche.service';

describe('TypeScheService', () => {
  let service: TypeScheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeScheService],
    }).compile();

    service = module.get<TypeScheService>(TypeScheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
