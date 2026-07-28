import { Module } from '@nestjs/common';
import { EpgService } from './epg.service';
import { EpgController } from './epg.controller';

@Module({
  providers: [EpgService],
  controllers: [EpgController],
})
export class EpgModule {}
