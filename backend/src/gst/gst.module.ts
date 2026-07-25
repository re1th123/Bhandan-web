import { Module } from '@nestjs/common';
import { GstService } from './gst.service';
import { GstController } from './gst.controller';

@Module({
  providers: [GstService],
  controllers: [GstController],
})
export class GstModule {}
