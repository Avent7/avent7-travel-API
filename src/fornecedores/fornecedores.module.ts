import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { FornecedoresService } from './fornecedores.service';
import { FornecedoresController } from './fornecedores.controller';
import { SupplierMongooseRepository } from './repositories/supplier.mongoose.repository';
import { SUPPLIER_REPOSITORY } from './interfaces/supplier.repository.interface';
import { PropostasModule } from '../propostas/propostas.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }]),
    PropostasModule,
  ],
  controllers: [FornecedoresController],
  providers: [
    FornecedoresService,
    { provide: SUPPLIER_REPOSITORY, useClass: SupplierMongooseRepository },
  ],
  exports: [FornecedoresService],
})
export class FornecedoresModule {}
