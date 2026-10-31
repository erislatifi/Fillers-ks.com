import type { GlobalConfig } from 'payload'
import { isStaff } from '../access/isAdmin'

// Every UI text of the public site (buttons, headings, form labels, messages) can be
// reworded here. Defaults live in messages/sq.json + en.json; this global only stores the
// texts the client changed, as one JSON object per language — so adding new texts to the
// site never needs a database migration. Merged in by src/i18n/request.ts.
export const SiteTexts: GlobalConfig = {
  slug: 'site-texts',
  label: 'Tekstet (fjalori)',
  admin: {
    group: 'Përmbajtja',
    description:
      'Çdo tekst i faqes: butonat, titujt, fushat e formave, mesazhet. Ndërro gjuhën lart për anglishten. Fusha bosh = teksti standard.',
  },
  access: {
    read: () => true,
    update: isStaff,
  },
  fields: [
    {
      name: 'overrides',
      type: 'json',
      localized: true,
      label: false,
      admin: { components: { Field: './components/admin/TextsEditor#TextsEditor' } },
    },
  ],
}
