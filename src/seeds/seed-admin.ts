import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ─── Load .env.developer ──────────────────────────────────────────────────────

const envPath = path.resolve(__dirname, '../../.env.developer');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI não encontrado em .env.developer');
  process.exit(1);
}

// ─── Minimal schemas (sem NestJS) ────────────────────────────────────────────

const AgencySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan:        { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
    brandConfig: { type: Object, default: {} },
    pricingConfig: {
      type: Object,
      default: {
        defaultMarkupPct: 20,
        platformTakeRatePct: 4,
        minCommissionUsd: 0,
        serviceFeeFixed: 50,
        serviceFeeMode: 'fixed',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const UserSchema = new mongoose.Schema(
  {
    agencyId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true },
    name:            { type: String, required: true, trim: true },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:        { type: String, required: true, select: false },
    role:            { type: String, enum: ['admin', 'employee', 'superadmin'], default: 'employee' },
    profileImageUrl: { type: String, default: null },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ─── Seed data ────────────────────────────────────────────────────────────────

const AGENCY = {
  name: 'Avent7 Travel',
  slug: 'avent7-travel',
  plan: 'pro',
};

const USERS = [
  { name: 'Super Admin',    email: 'superadmin@avent7.com', password: '123456', role: 'superadmin' },
  { name: 'Admin Avent7',   email: 'admin@avent7.com',      password: '123456', role: 'admin'      },
  { name: 'João Employee',  email: 'employee@avent7.com',   password: '123456', role: 'employee'   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  MongoDB conectado\n');

  const AgencyModel = mongoose.model('Agency', AgencySchema);
  const UserModel   = mongoose.model('User',   UserSchema);

  // Upsert agency
  let agency = await AgencyModel.findOne({ slug: AGENCY.slug });
  if (!agency) {
    agency = await AgencyModel.create(AGENCY);
    console.log(`🏢  Agência criada: ${agency.name} (${agency._id})`);
  } else {
    console.log(`🏢  Agência já existe: ${agency.name} (${agency._id})`);
  }

  const agencyId = agency._id;

  // Upsert users
  for (const u of USERS) {
    const existing = await UserModel.findOne({ email: u.email });

    if (existing) {
      console.log(`⚠️   Usuário já existe: ${u.email} — pulando`);
      continue;
    }

    const hashed = await bcrypt.hash(u.password, 10);
    await UserModel.create({ ...u, password: hashed, agencyId });

    console.log(`👤  Criado [${u.role.padEnd(10)}]  ${u.email}  /  senha: ${u.password}`);
  }

  console.log('\n✅  Seed concluído!\n');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Erro no seed:', err);
  process.exit(1);
});
