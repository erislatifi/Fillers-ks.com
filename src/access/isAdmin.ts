import type { Access, PayloadRequest } from 'payload'

// Two kinds of people can be logged in: admin-panel staff (`users`) and clinic
// customers (`customers`). Payload's default access ("any logged-in user") would let a
// customer edit the catalog through the REST API, so every write must check these instead.
//
// `users` have roles:
//   admin  — everything
//   editor — catalog and content, no sales data
//   agent  — sales agent: only their own orders, clinics and commission report
// A user with no roles at all is treated as admin, so accounts created before roles
// mattered keep full access.

type StaffUser = { collection?: string; roles?: (string | null)[] | null }

const roles = (user: StaffUser | null | undefined) => (user?.collection === 'users' ? user.roles ?? [] : null)

export const hasAdminRole = (user: StaffUser | null | undefined) => {
  const r = roles(user)
  return r !== null && (r.length === 0 || r.includes('admin'))
}

/** Admin or editor — may change the catalog and content. Agents are not staff. */
export const hasStaffRole = (user: StaffUser | null | undefined) =>
  hasAdminRole(user) || Boolean(roles(user)?.includes('editor'))

/** A sales agent who is neither admin nor editor. */
export const isAgentOnly = (user: StaffUser | null | undefined) =>
  Boolean(roles(user)?.includes('agent')) && !hasStaffRole(user)

/** Anyone allowed into /admin (admins, editors, agents). */
export const isPanelUser = (req: PayloadRequest) => req.user?.collection === 'users'

export const isStaffUser = (req: PayloadRequest) => hasStaffRole(req.user as StaffUser | null)

/** Full admin: orders, customers, messages, settings, users. */
export const isAdminUser = (req: PayloadRequest) => hasAdminRole(req.user as StaffUser | null)

export const isAgentUser = (req: PayloadRequest) => isAgentOnly(req.user as StaffUser | null)

export const isAdmin: Access = ({ req }) => isAdminUser(req)

/** Any staff member (admin or editor): catalog and content. */
export const isStaff: Access = ({ req }) => isStaffUser(req)

// Default access for content collections: everyone reads, any staff member writes.
export const publicReadAdminWrite = {
  read: () => true,
  create: isStaff,
  update: isStaff,
  delete: isStaff,
}

/** Admin-only screens (settings, users, messages…): hidden from editors and agents. */
export const hiddenForEditors = ({ user }: { user: StaffUser | null }) => !hasAdminRole(user)

/** Sales screens agents also use (orders, clinics): hidden from editors only. */
export const hiddenForNonSales = ({ user }: { user: StaffUser | null }) =>
  !hasAdminRole(user) && !roles(user)?.includes('agent')

/** Catalog/content screens: hidden from agents, who can't edit them. */
export const hiddenForAgents = ({ user }: { user: StaffUser | null }) => isAgentOnly(user)
