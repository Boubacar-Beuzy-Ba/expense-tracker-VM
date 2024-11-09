import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePermissions() {
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const hasRole = (requiredRole: string) => {
    if (!user || !userProfile) return false;
    return userProfile.role === requiredRole;
  };

  return { hasRole, userProfile };
}