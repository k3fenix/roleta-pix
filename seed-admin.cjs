const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function createAdmin() {
  console.log("Creating admin@admin.com...");
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@admin.com',
    password: 'admin123',
    options: {
      data: {
        name: 'Administrador'
      }
    }
  });
  if (error) {
    console.error('Error creating admin:', error);
    // If it already exists, maybe try logging in to get the ID
    if (error.message.includes('already registered')) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
            email: 'admin@admin.com',
            password: 'admin123'
        });
        if (signInData?.user) {
            console.log('User already exists. Updating role to admin...');
            const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', signInData.user.id);
            if (updateError) console.error('Error updating role:', updateError);
            else console.log('Admin role assigned successfully!');
        }
    }
    return;
  }
  
  if (data.user) {
    console.log('User created:', data.user.id);
    const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
    if (updateError) {
        console.error('Error updating role:', updateError);
    } else {
        console.log('Admin role assigned successfully!');
    }
  }
}

createAdmin();
