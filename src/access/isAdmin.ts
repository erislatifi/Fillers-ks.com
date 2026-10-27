import type { Access, PayloadRequest } from 'payload'

// Two kinds of people can be logged in: admin-panel staff (`users`) and clinic
// customers (`customers`). Payload's default access ("any logged-in user") would let a
// customer edit the catalog through the REST API, so every write must check this instead.
export const isAdminUser = (req: PayloadRequest) => req.user?.collection === 'users'

export const isAdmin: Access = ({ req }) => isAdminUser(req)

// Default access for content collections: everyone reads, only staff write.
export const publicReadAdminWrite = {
  read: () => true,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}
