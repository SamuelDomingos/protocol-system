import { useAuth } from "@/contexts/auth-context"

type PermissionType = "canRead" | "canCreate" | "canUpdate" | "canDelete"

export function usePermissions() {
  const { hasPermission } = useAuth()

  const checkPermission = (module: string, permission: PermissionType) => {
    return hasPermission(module as any, permission)
  }

  const getModulePermissions = (module: string) => {
    return {
      canView: checkPermission(module, "canRead"),
      canCreate: checkPermission(module, "canCreate"),
      canUpdate: checkPermission(module, "canUpdate"),
      canDelete: checkPermission(module, "canDelete"),
    }
  }

  return {
    checkPermission,
    getModulePermissions,
  }
} 