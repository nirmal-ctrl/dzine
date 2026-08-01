import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Bulletproof env loading for different process CWDs
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'Somae-webapp', '.env') })

let rawUrl = process.env.DATABASE_URL

// Strip wrapping quotes if present
if (rawUrl) {
  if (rawUrl.startsWith("'") && rawUrl.endsWith("'")) {
    rawUrl = rawUrl.slice(1, -1)
  } else if (rawUrl.startsWith('"') && rawUrl.endsWith('"')) {
    rawUrl = rawUrl.slice(1, -1)
  }
  process.env.DATABASE_URL = rawUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not defined in process.env")
  }
  const pool = new Pool({ connectionString: rawUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
