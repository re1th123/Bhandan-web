import { Injectable } from '@nestjs/common';

@Injectable()
export class FinanceService {
  getReport() { return { status: 'OK' }; }
}
