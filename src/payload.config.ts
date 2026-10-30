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
import { Customers } from './collections/Customers'
import { Pages } from './collections/Pages'
import { ContactMessages } from './collections/ContactMessages'
import { Subscribers } from './collections/Subscribers'
import { SiteSettings } from './globals/SiteSettings'
import { Homepage } from './globals/Homepage'
import { adminTranslationsSq } from './i18n/adminTranslations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
// bucket credentials are configured. The plugin is always registered (just
// disabled locally) so the generated admin importMap is identical in dev and
// prod — without its S3ClientUploadHandler, production /admin renders blank.
const plugins: Plugin[] = [
  s3Storage({
    enabled: Boolean(process.env.S3_BUCKET),
    collections: { media: true },
    bucket: process.env.S3_BUCKET || '',
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
]

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: ' · Fillers Kosovo',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['./components/admin/NavTop#NavTop'],
      beforeLogin: ['./components/admin/LoginPanel#LoginPanel'],
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
  collections: [Orders, Customers, ContactMessages, Subscribers, Products, Brands, Categories, Media, Testimonials, Articles, Promotions, Pages, Users],
  globals: [Homepage, SiteSettings],
  localization: {
    locales: ['sq', 'en'],
    defaultLocale: 'sq',
  },
  editor: lexicalEditor(),
  i18n: {
    // No Albanian pack exists in Payload, so we re-word the English one in Albanian.
    translations: { en: adminTranslationsSq },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  plugins,
  sharp,
})
