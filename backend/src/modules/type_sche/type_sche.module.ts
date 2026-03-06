import { Module } from '@nestjs/common';
import { TypeScheController } from './type_sche.controller';
import { TypeScheService } from './type_sche.service';

@Module({
  controllers: [TypeScheController],
  providers: [TypeScheService]
})
export class TypeScheModule {}
