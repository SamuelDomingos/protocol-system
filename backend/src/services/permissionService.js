class PermissionService {
  getUserPermissions(role) {
    return {
      clients: {
        canCreate: ['admin', 'doctor', 'closing'].includes(role),
        canRead: true,
        canUpdate: ['admin', 'doctor', 'closing'].includes(role),
        canDelete: role === 'admin',
        allowedPages: ['/clients', '/clients/new', '/clients/[id]']
      },
      protocols: {
        canCreate: ['admin', 'closing'].includes(role),
        canRead: true,
        canUpdate: ['admin', 'closing'].includes(role),
        canDelete: role === 'admin',
        allowedPages: ['/protocols', '/protocols/new', '/protocols/[id]']
      },
      applications: {
        canCreate: ['admin', 'technique'].includes(role),
        canRead: true,
        canUpdate: ['admin', 'technique'].includes(role),
        canDelete: role === 'admin',
        allowedPages: ['/applications', '/applications/new', '/applications/[id]']
      },
      users: {
        canCreate: role === 'admin',
        canRead: role === 'admin',
        canUpdate: role === 'admin',
        canDelete: role === 'admin',
        allowedPages: ['/users', '/users/new', '/users/[id]']
      },
      stock: {
        canCreate: ['admin', 'stock'].includes(role),
        canRead: true,
        canUpdate: ['admin', 'stock'].includes(role),
        canDelete: role === 'admin',
        allowedPages: ['/stock', '/stock/new', '/stock/[id]']
      }
    };
  }
}

module.exports = new PermissionService();