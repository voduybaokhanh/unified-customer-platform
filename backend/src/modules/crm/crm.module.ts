// backend/src/modules/crm/crm.module.ts
import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService], // Export để modules khác có thể sử dụng
})
export class CrmModule {}