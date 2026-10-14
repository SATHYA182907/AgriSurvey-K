import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { Profile, UserRole } from '@/types';

export class AuthService {
  async getCurrentUser(): Promise<Profile | null> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile || null;
    }

    return mockDb.currentUser;
  }

  async signIn(email: string, password?: string): Promise<{ user: Profile; token?: string }> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'TestPass123!',
      });
      if (error) throw error;
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (pError || !profile) throw new Error('Profile record not found for user');
      return { user: profile, token: data.session.access_token };
    }

    // Dev Simulation
    const existing = mockDb.profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      mockDb.setCurrentUser(existing.id);
      return { user: existing };
    }

    // Default to first user if email doesn't match
    const user = mockDb.setCurrentUser(mockDb.profiles[0].id)!;
    return { user };
  }

  async signUpFarmer(
    fullName: string,
    email: string,
    phone: string,
    password?: string
  ): Promise<Profile> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'FarmerAgriPass123!',
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            role: 'farmer',
          },
        },
      });
      if (error) throw error;

      // Profile is auto-created by postgres trigger on_auth_user_created
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user!.id)
        .single();

      return profile;
    }

    // Dev Simulation
    const newProfile: Profile = {
      id: `usr-farmer-${Date.now()}`,
      full_name: fullName,
      email,
      phone_number: phone,
      role: 'farmer',
      account_status: 'active',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.profiles.push(newProfile);
    mockDb.setCurrentUser(newProfile.id);
    mockDb.persistAll();
    return newProfile;
  }

  async signOut(): Promise<void> {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // In dev mode, keep the user or reset to Ramesh Patil
    mockDb.setCurrentUserByRole('farmer');
  }

  switchRole(role: UserRole): Profile {
    return mockDb.setCurrentUserByRole(role);
  }

  getAvailablePersonas(): Profile[] {
    return mockDb.profiles;
  }
}

export const authService = new AuthService();
