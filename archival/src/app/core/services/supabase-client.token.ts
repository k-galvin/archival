import { InjectionToken } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SupabaseClient', {
  providedIn: 'root',
  factory: () => createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      db: {
        schema: 'public',
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }
  )
});
