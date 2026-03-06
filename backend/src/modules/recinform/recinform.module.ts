import { Module } from '@nestjs/common';
import { RecinformController } from './recinform.controller';
import { RecinformService } from './recinform.service';

@Module({
  controllers: [RecinformController],
  providers: [RecinformService]
})
export class RecinformModule {}
