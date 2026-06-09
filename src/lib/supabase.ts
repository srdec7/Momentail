import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aexotymcslltbnokqbza.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-sQ6HRHf5FcwfuICw1hSEg_QX8oNlot';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
