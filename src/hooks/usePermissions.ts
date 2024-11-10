import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  role: string;
  permissions?: string[];
  department?: string;
}


export function usePermissions() {
  const { user } = useAuth();

  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery<UserProfile | null>({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {

      if (!user) {
        console.log("No user found in auth context");
        return null;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const hasRole = (requiredRole: string) => {
    if (!user || !userProfile) return false;
    return userProfile.role === requiredRole;
  };

  // Added hasPermission function
 const hasPermission = (permission: string) => {
   if (!userProfile) return false;

   // Admin override - should see everything
   if (userProfile.role === "admin") {
     return true;
   }

   // Core features override - always show transactions for authenticated users
   if (permission === "read:transactions" || permission === "transactions") {
     // You can restrict to specific roles if needed
     const allowedRoles = ["admin", "user", "manager", "accountant"];
     return allowedRoles.includes(userProfile.role);
   }

   // For other permissions, check the permissions array
   if (!userProfile.permissions) return false;
   return userProfile.permissions.includes(permission);
 };


  return {
    hasRole,
    hasPermission, // Added this
    userProfile,
    isLoading,
    error,
    user,
  };
}
