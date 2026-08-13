import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const normalize = (v) => {
  if (!v) throw new Error("DATABASE_URL is not set");
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    return v.slice(1, -1);
  }
  return v;
};

const licenseKey = process.argv[2];
const removeTestDevices = process.argv.includes("--remove-test-devices");

const pool = new Pool({ connectionString: normalize(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  if (removeTestDevices) {
    const removed = await prisma.deviceActivation.deleteMany({
      where: { deviceHash: { startsWith: "test-device" } },
    });
    if (removed.count > 0) {
      // Keep the counter in sync after removing test activations
      const license = await prisma.license.findUnique({ where: { licenseKey } });
      if (license) {
        const realCount = await prisma.deviceActivation.count({
          where: { licenseId: license.id },
        });
        await prisma.license.update({
          where: { id: license.id },
          data: { activatedDevices: realCount },
        });
        console.log(`Removed ${removed.count} test activation(s).`);
      }
    }
  }

  const license = await prisma.license.findUnique({
    where: { licenseKey },
    include: { activations: true },
  });

  if (!license) {
    console.log("NOT FOUND");
  } else {
    console.log(
      JSON.stringify(
        {
          licenseKey: license.licenseKey,
          plan: license.plan,
          isActive: license.isActive,
          maxDevices: license.maxDevices,
          activatedDevices: license.activatedDevices,
          remainingDevices: license.maxDevices - license.activatedDevices,
        },
        null,
        2
      )
    );
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
