import type { Block, Field } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// Building blocks the client stacks to build the homepage and text pages from the admin.
// Rendered by src/components/blocks/RenderBlocks.tsx — add a block here AND there.

const button = (prefix: string, label: string): Field => ({
  type: 'row',
  fields: [
    { name: `${prefix}Label`, type: 'text', localized: true, label: `${label} — teksti` },
    {
      name: `${prefix}Href`,
      type: 'text',
      label: `${label} — lidhja`,
      admin: { description: 'P.sh. /catalog, /contact, /info/oferta ose https://…' },
    },
  ],
})

const heading: Field[] = [
  { name: 'eyebrow', type: 'text', localized: true, label: 'Teksti i vogël mbi titull' },
  { name: 'title', type: 'text', localized: true, label: 'Titulli' },
]

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Tekst', plural: 'Tekste' },
  fields: [
    ...heading,
    { name: 'body', type: 'richText', localized: true, label: 'Teksti', editor: lexicalEditor() },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Foto + tekst', plural: 'Foto + tekst' },
  fields: [
    ...heading,
    { name: 'text', type: 'textarea', localized: true, label: 'Teksti' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Foto' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      label: 'Foto në',
      options: [
        { label: 'Majtas', value: 'left' },
        { label: 'Djathtas', value: 'right' },
      ],
    },
    button('button', 'Butoni'),
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'Banner me butona', plural: 'Banera me butona' },
  fields: [
    ...heading,
    { name: 'text', type: 'textarea', localized: true, label: 'Teksti' },
    button('button', 'Butoni kryesor'),
    button('secondary', 'Butoni i dytë'),
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'dark',
      label: 'Ngjyra',
      options: [
        { label: 'E errët', value: 'dark' },
        { label: 'Rozë (brendi)', value: 'accent' },
        { label: 'E çelët', value: 'light' },
      ],
    },
  ],
}

export const ProductRowBlock: Block = {
  slug: 'productRow',
  labels: { singular: 'Rresht produktesh', plural: 'Rreshta produktesh' },
  fields: [
    ...heading,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'bestSellers',
      label: 'Cilat produkte',
      options: [
        { label: 'Më të shiturat', value: 'bestSellers' },
        { label: 'Të rejat', value: 'newArrivals' },
        { label: 'Me zbritje', value: 'onSale' },
        { label: 'Nga një brend', value: 'brand' },
        { label: 'Nga një kategori', value: 'category' },
        { label: 'I zgjedh vetë', value: 'manual' },
      ],
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      label: 'Brendi',
      admin: { condition: (_, s) => s?.source === 'brand' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategoria',
      admin: { condition: (_, s) => s?.source === 'category' },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Produktet',
      admin: { condition: (_, s) => s?.source === 'manual' },
    },
    { name: 'limit', type: 'number', defaultValue: 8, min: 1, max: 24, label: 'Sa produkte (maksimumi)' },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Pyetje dhe përgjigje', plural: 'Pyetje dhe përgjigje' },
  fields: [
    ...heading,
    {
      name: 'items',
      type: 'array',
      label: 'Pyetjet',
      labels: { singular: 'Pyetje', plural: 'Pyetjet' },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true, label: 'Pyetja' },
        { name: 'answer', type: 'textarea', required: true, localized: true, label: 'Përgjigja' },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Video' },
  fields: [
    ...heading,
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Lidhja e videos',
      admin: { description: 'Lidhje nga YouTube ose Vimeo.' },
    },
  ],
}

/** Generic blocks available on text pages and the homepage. */
export const contentBlocks: Block[] = [RichTextBlock, ImageTextBlock, CtaBlock, ProductRowBlock, FaqBlock, VideoBlock]

/** One of the built-in homepage sections (brands, best sellers, …), placed among the blocks. */
export const SectionBlock: Block = {
  slug: 'section',
  labels: { singular: 'Seksion i gatshëm', plural: 'Seksione të gatshme' },
  fields: [
    {
      name: 'section',
      type: 'select',
      required: true,
      label: 'Seksioni',
      options: [
        { label: 'Brendet', value: 'brands' },
        { label: 'Rreth nesh', value: 'about' },
        { label: 'Pajisjet (Jeisys, Clarius…)', value: 'devices' },
        { label: 'Më të shiturat', value: 'bestSellers' },
        { label: 'Kategoritë', value: 'categories' },
        { label: 'Pse ne', value: 'why' },
        { label: 'Të rejat', value: 'newArrivals' },
        { label: 'Qendra edukative', value: 'education' },
        { label: 'Promocionet', value: 'promotions' },
        { label: 'Vlerësimet e klinikave', value: 'testimonials' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    {
      name: 'isHidden',
      type: 'checkbox',
      defaultValue: false,
      label: 'Fshehe përkohësisht',
    },
    ...heading,
    { name: 'description', type: 'textarea', localized: true, label: 'Përshkrimi' },
  ],
}
