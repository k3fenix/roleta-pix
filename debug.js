import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: users } = await supabase.from('profiles').select('id, free_spins').limit(1);
  console.log('Users:', users);
  
  if (users && users.length > 0) {
    const { data, error } = await supabase.rpc('debit_spin', { user_uuid: users[0].id });
    console.log('debit_spin(user_uuid) result:', data, error);

    const { data: data2, error: error2 } = await supabase.rpc('debit_spin', { spin_cost_cents: 0, user_uuid: users[0].id });
    console.log('debit_spin(spin_cost_cents, user_uuid) result:', data2, error2);
  }
}
test();
