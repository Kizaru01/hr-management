import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.respository';

@Module({
  controllers: [BranchController],
  providers: [BranchService, BranchRepository],
  exports: [BranchRepository],
})
export class BranchModule {}
