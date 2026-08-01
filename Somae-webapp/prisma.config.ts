import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

let url = process.env.DATABASE_URL
if (url) {
  if (url.startsWith("'") && url.endsWith("'")) {
    url = url.slice(1, -1)
  } else if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1)
  }
}

export default defineConfig({
  datasource: {
    url: url,
  },
})
