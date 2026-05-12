import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.developer') });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não configurado');

  await mongoose.connect(uri);
  console.log('Conectado ao MongoDB');

  const result = await mongoose.connection.collection('propostablocks').deleteMany({});
  console.log(`Deletados ${result.deletedCount} blocos`);

  await mongoose.disconnect();
  console.log('Concluído');
}

main().catch(console.error);
