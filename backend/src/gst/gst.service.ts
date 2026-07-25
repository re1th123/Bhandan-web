import { Injectable } from '@nestjs/common';

@Injectable()
export class GstService {
  getSummary() { return { status: 'OK' }; }
}
