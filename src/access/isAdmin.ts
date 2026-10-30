import type { Access, PayloadRequest } from 'payload'

// Two kinds of people can be logged in: admin-panel staff (`users`) and clinic
// customers (`customers`). Payload's default access ("any logged-in user") would let a
// customer edit the catalog through the REST API, so every write must check these instead.
//
// Staff have roles: "admin" sees everything; "editor" manages the catalog and content but
// not orders, customers, messages, settings or users. A staff user with no roles at all is
// treated as admin, so accounts created before roles mattered keep full access.

type StaffUser = { collection?: string; roles?: (string | null)[] | null }

export const isStaffUser = (req: PayloadRequest) => req.user?.collection === 'users'

export const hasAdminRole = (user: StaffUser | null | undefined) =>
  user?.collection === 'users' && (!user.roles?.length || user.roles.includes('admin'))

/** Full admin: orders, customers, messages, settings, users. */
export const isAdminUser = (req: PayloadRequest) => hasAdminRole(req.user as StaffUser | null)

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

/** Hide sales/admin-only collections from editors' sidebar. */
export const hiddenForEditors = ({ user }: { user: StaffUser | null }) => !hasAdminRole(user)
