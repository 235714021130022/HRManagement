import { Test, TestingModule } from '@nestjs/testing';
import { TypescheLinkService } from './typesche_link.service';

describe('TypescheLinkService', () => {
  let service: TypescheLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypescheLinkService],
    }).compile();

    service = module.get<TypescheLinkService>(TypescheLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
