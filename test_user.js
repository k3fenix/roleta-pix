import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = `test_${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { name: 'Test User' }
    }
  });

  if (authError) {
    console.error('Signup error:', authError);
    return;
  }

  console.log('User signed up:', authData.user?.id);
  
  // Wait a second for triggers
  await new Promise(r => setTimeout(r, 1000));

  const { data: debitData, error: debitError } = await supabase.rpc('debit_spin', {
    spin_cost_cents: 0,
    user_uuid: authData.user?.id
  });

  console.log('Debit Spin Result:', debitData, debitError);
}

test();
