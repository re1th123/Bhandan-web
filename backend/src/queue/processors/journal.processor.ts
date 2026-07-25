import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('journal')
export class JournalProcessor {
  @Process('create')
  async handleCreate(job: Job) {
    console.log(job.data);
  }
}
