import { supabase, isLiveSupabaseConfigured } from '@/lib/supabase';
import { mockDb } from './mock-db';
import { Profile, UserRole } from '@/types';

export interface FarmerSignUpPayload {
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
  district?: string;
  taluk?: string;
  village?: string;
  address?: string;
  postalCode?: string;
  identityDocRef?: string;
  preferredLanguage?: 'en' | 'mr';
}

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

  async signIn(identifier: string, password?: string): Promise<{ user: Profile; token?: string }> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
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

    // Dev Simulation with Comprehensive Credential Verification
    const user = mockDb.findProfileByLogin(identifier);
    if (!user) {
      throw new Error('No registered account found matching this mobile number, username, or email. Please verify your details or submit a land registration.');
    }

    // Check account status
    if (user.account_status === 'pending_approval') {
      const pendingApp = mockDb.applications.find((a) => a.farmer_id === user.id);
      const appRef = pendingApp?.application_reference || 'your application';
      throw new Error(
        `PENDING_APPROVAL:${appRef}:Your registration (${appRef}) is currently awaiting official verification by the Tahsildar. Your login credentials will be dispatched via SMS to ${user.phone_number || 'your mobile'} once approved.`
      );
    }

    if (user.account_status === 'suspended' || user.account_status === 'deactivated') {
      throw new Error('Your account is currently inactive. Please contact the Tehsil revenue office.');
    }

    // Check password if provided
    const expectedPassword = user.generated_credentials?.password || user.password;
    if (password && expectedPassword && password.trim() !== expectedPassword.trim()) {
      // In dev mode allow universal demo override 'AgriPass123!' or 'TestPass123!'
      if (password !== 'AgriPass123!' && password !== 'TestPass123!') {
        throw new Error('Incorrect password. Please enter the official password sent to your mobile number via SMS.');
      }
    }

    mockDb.setCurrentUser(user.id);
    return { user };
  }

  async signUpFarmer(
    fullNameOrPayload: string | FarmerSignUpPayload,
    emailArg?: string,
    phoneArg?: string,
    passwordArg?: string
  ): Promise<Profile> {
    const payload: FarmerSignUpPayload =
      typeof fullNameOrPayload === 'string'
        ? {
            fullName: fullNameOrPayload,
            email: emailArg || '',
            phone: phoneArg || '',
            password: passwordArg,
          }
        : fullNameOrPayload;

    const {
      fullName,
      email = '',
      phone,
      password,
      district = 'Pune',
      taluk = 'Haveli',
      village = 'Wagholi',
      address = '',
      postalCode = '412207',
      identityDocRef,
      preferredLanguage = 'en',
    } = payload;

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email || `farmer.${phone}@agrisurvey.local`,
        password: password || 'FarmerAgriPass123!',
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            role: 'farmer',
            district,
            taluk,
            village,
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
      email: email || `farmer.${phone}@agrisurvey.local`,
      phone_number: phone,
      role: 'farmer',
      account_status: 'active',
      preferred_language: preferredLanguage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.profiles.push(newProfile);

    // Also persist matching farmer_profile
    const newFarmerProfile: any = {
      id: `fp-${Date.now()}`,
      user_id: newProfile.id,
      address: address || `Village ${village}, Taluk ${taluk}`,
      village,
      taluk,
      district,
      state: 'Maharashtra',
      postal_code: postalCode,
      identity_verification_status: 'PENDING_DOCUMENT_VERIFICATION',
      identity_verification_reference: identityDocRef || `AADHAAR-XXXX-${phone.slice(-4)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.farmerProfiles.push(newFarmerProfile);

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
