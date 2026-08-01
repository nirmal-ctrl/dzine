import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

function normalizeDatabaseUrl(value) {
  if (!value) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function generateLicenseKey() {
  const uuid = uuidv4().replace(/-/g, "").toUpperCase();
  const parts = uuid.match(/.{1,4}/g) || [];
  return `QKZ-${parts.slice(0, 4).join("-")}`;
}

const email = process.argv[2] || "dev@huenxt.local";
const name = process.argv[3] || "Dev User";
const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  const license = await prisma.license.create({
    data: {
      userId: user.id,
      licenseKey: generateLicenseKey(),
      plan: "LIFETIME",
      paymentStatus: "DEV_MANUAL",
      paymentAmount: 0,
      maxDevices: 2,
      isActive: true,
    },
  });

  console.log(license.licenseKey);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
