import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicReadAdminWrite } from '../access/isAdmin'

// Text pages edited from the admin: privacy, terms, shipping, FAQ, and any page the
// client adds later. The slugs privacy/terms/shipping/faq have their own routes; any
// other slug is served at /info/<slug> (see src/lib/pages.ts).
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Faqe', plural: 'Faqet' },
  admin: {
    useAsTitle: 'title',
    group: 'Përmbajtja',
    defaultColumns: ['title', 'slug', 'showInFooter', 'updatedAt'],
    description:
      'Privatësia, kushtet, dërgesa, pyetjet e shpeshta dhe faqe të tjera me tekst. Shkruaji në shqip, pastaj ndërro gjuhën lart për anglishten.',
  },
  access: publicReadAdminWrite,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titulli' },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: 'Hyrja',
      admin: { description: 'Një fjali e shkurtër nën titull (opsionale).' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: 'Përmbajtja',
      editor: lexicalEditor(),
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Pyetje dhe përgjigje',
      labels: { singular: 'Pyetje', plural: 'Pyetjet' },
      admin: { description: 'Shfaqen si listë që hapet me klik, nën përmbajtjen (p.sh. te faqja FAQ).' },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true, label: 'Pyetja' },
        { name: 'answer', type: 'textarea', required: true, localized: true, label: 'Përgjigja' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Adresa (slug)',
      admin: {
        position: 'sidebar',
        description:
          'privacy, terms, shipping dhe faq kanë adresat e tyre. Për faqe të reja përdor p.sh. "kthimet" → /info/kthimet.',
      },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: true,
      label: 'Shfaqe në fund të faqes (footer)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      label: 'Përshkrimi për Google',
      admin: { position: 'sidebar' },
    },
  ],
}
