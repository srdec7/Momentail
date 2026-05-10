import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yjubnrongyvkstpttzzc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mYGgEMZjfATXynzMI5lRWg_XmEb75mb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
