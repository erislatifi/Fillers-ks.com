import type { Access, CheckboxField, Where } from 'payload'
import { isStaffUser } from '../access/isAdmin'

/**
 * "I dukshëm në faqe" — untick to take something off the public site without deleting it.
 * Public queries filter with `VISIBLE` (src/lib/payload.ts); staff still see everything in the admin.
 */
export const visibleField = (description: string): CheckboxField => ({
  name: 'visible',
  type: 'checkbox',
  defaultValue: true,
  label: 'I dukshëm në faqe',
  admin: { position: 'sidebar', description },
})

export const VISIBLE_WHERE: Where = { visible: { not_equals: false } }

/** Public REST/GraphQL reads never return hidden docs; staff read everything. */
export const readVisibleOrStaff: Access = ({ req }) => (isStaffUser(req) ? true : VISIBLE_WHERE)
