import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Testimonials } from './collections/Testimonials'
import { Articles } from './collections/Articles'
import { Promotions } from './collections/Promotions'
import { Orders } from './collections/Orders'
import { SiteSettings } from './globals/SiteSettings'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// TEMP diagnostic: Payload/Drizzle swallows the real driver error in prod
// logs (only the "Failed query" wrapper shows). Log the raw connection
// outcome so the underlying cause (auth, SSL, network, ...) is visible.
if (process.env.POSTGRES_URI) {
  try {
    const u = new URL(process.env.POSTGRES_URI)
    console.log(
      `[db-check] Runtime POSTGRES_URI target -> user=${u.username} host=${u.hostname} port=${u.port} db=${u.pathname}`,
    )
  } catch (err) {
    console.error('[db-check] Could not parse POSTGRES_URI:', err)
  }
  void import('pg').then(async ({ Client }) => {
    const client = new Client({ connectionString: process.env.POSTGRES_URI })
    try {
      await client.connect()
      const { rows } = await client.query(
        `select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
      )
      console.log(
        '[db-check] Postgres connection OK. Tables in public schema:',
        rows.map((r) => r.table_name).join(', ') || '(none)',
      )
      await client.end()
    } catch (err) {
      console.error('[db-check] Postgres connection FAILED:', err)
    }
  })
}

// Local dev keeps using the local SQLite file (zero setup). In production
// (Hostinger's managed Node.js hosting), local disk isn't guaranteed to
// persist across deploys, so we switch to a real Postgres database whenever
// POSTGRES_URI is set.
const db = process.env.POSTGRES_URI
  ? postgresAdapter({
      pool: {
        connectionString: process.env.POSTGRES_URI,
      },
    })
  : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URI || 'file:./payload.db',
      },
    })

// Same idea for uploaded media: local disk locally, S3-compatible cloud
// storage (e.g. Supabase Storage / Cloudflare R2) in production whenever the
// bucket credentials are configured.
const plugins: Plugin[] = []
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: './components/admin/Dashboard#Dashboard',
        },
      },
      graphics: {
        Icon: './components/admin/Logo#Icon',
        Logo: './components/admin/Logo#Logo',
      },
    },
  },
  collections: [Users, Media, Brands, Categories, Products, Testimonials, Articles, Promotions, Orders],
  globals: [SiteSettings, Homepage],
  localization: {
    locales: ['sq', 'en'],
    defaultLocale: 'sq',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  plugins,
  sharp,
})
