import { Module } from '@nestjs/common';
import { TypescheLinkController } from './typesche_link.controller';
import { TypescheLinkService } from './typesche_link.service';

@Module({
  controllers: [TypescheLinkController],
  providers: [TypescheLinkService]
})
export class TypescheLinkModule {}
