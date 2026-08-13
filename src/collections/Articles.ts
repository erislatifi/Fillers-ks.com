import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'excerpt', type: 'textarea', required: true, localized: true },
    {
      name: 'tag',
      type: 'select',
      required: true,
      options: ['Treatment Guide', 'Comparison', 'Education'],
    },
    { name: 'readTime', type: 'text' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      localized: true,
    },
  ],
}
