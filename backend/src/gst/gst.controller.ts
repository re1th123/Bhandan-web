import { Controller, Get } from '@nestjs/common';
import { GstService } from './gst.service';

@Controller('gst')
export class GstController {
  constructor(private readonly gstService: GstService) {}
  @Get()
  getSummary() { return this.gstService.getSummary(); }
}
