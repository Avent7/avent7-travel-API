import { Module } from '@nestjs/common';
import { PropostaBlocksService } from './proposta-blocks.service';
import { PropostaBlocksController } from './proposta-blocks.controller';
import { PropostasModule } from '../propostas/propostas.module';

@Module({
  imports: [PropostasModule],
  controllers: [PropostaBlocksController],
  providers: [PropostaBlocksService],
  exports: [PropostaBlocksService],
})
export class PropostaBlocksModule {}
