import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategori', plural: 'Kategoritë' },
  admin: {
    useAsTitle: 'name',
    group: 'Katalogu',
    description: 'Grupet e produkteve (p.sh. Filerë dermik, Biostimulues). Përdoren si filtra në katalog.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, localized: true, label: 'Emri i kategorisë' },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          label: 'Adresa në lidhje (slug)',
          admin: { description: 'Vetëm shkronja të vogla, numra dhe viza.' },
        },
      ],
    },
    { name: 'description', type: 'text', localized: true, label: 'Përshkrim i shkurtër' },
    {
      name: 'icon',
      type: 'select',
      required: true,
      label: 'Ikona',
      admin: { description: 'Shfaqet te karta e kategorisë në Ballinë.' },
      options: [
        { label: 'Pikë', value: 'drop' },
        { label: 'Shkëlqim', value: 'sparkle' },
        { label: 'Flokë', value: 'hair' },
        { label: 'Qelizë', value: 'cell' },
        { label: 'Kanulë', value: 'cannula' },
        { label: 'Gjilpërë', value: 'needle' },
        { label: 'Mezoterapi', value: 'meso' },
        { label: 'Mbrojtje', value: 'shield' },
        { label: 'Laser', value: 'laser' },
      ],
    },
  ],
}
