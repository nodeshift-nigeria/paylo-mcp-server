import { createClient } from '@supabase/supabase-js';

// Public Supabase Credentials
const DEFAULT_SUPABASE_URL = 'https://syyvsgfsopldoccvivni.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eXZzZ2Zzb3BsZG9jY3Zpdm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTAyNjAsImV4cCI6MjA2OTI4NjI2MH0.TYmLCFK1fE238J-HRbOWLN6WtVhQocC8moTzu9os5eg';

const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
