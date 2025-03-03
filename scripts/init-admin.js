// Skripta za inicijalizaciju administratorskog naloga
// Pokrenite ovu skriptu sa: node scripts/init-admin.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Konfiguracija Supabase klijenta
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Nedostaju Supabase URL ili Service Role Key u .env fajlu');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Podaci za administratorski nalog
const adminEmail = process.env.ADMIN_EMAIL || 'admin@topdom.rs';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  console.error('Nedostaje ADMIN_PASSWORD u .env fajlu');
  process.exit(1);
}

async function initAdmin() {
  console.log(`Inicijalizacija administratorskog naloga: ${adminEmail}`);

  try {
    // 1. Proveravamo da li korisnik već postoji
    const { data: existingUsers, error: fetchError } =
      await supabase.auth.admin.listUsers();

    if (fetchError) {
      throw fetchError;
    }

    const existingAdmin = existingUsers.users.find(
      (user) => user.email === adminEmail
    );

    if (existingAdmin) {
      console.log('Administrator već postoji, preskačemo kreiranje naloga');

      // Proveravamo da li postoji profil
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', existingAdmin.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!existingProfile) {
        // Kreiramo profil za postojećeg administratora
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: existingAdmin.id,
            role: 'admin'
          });

        if (insertError) throw insertError;
        console.log('Kreiran administratorski profil za postojećeg korisnika');
      } else if (existingProfile.role !== 'admin') {
        // Ažuriramo ulogu na admin ako nije već postavljena
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role: 'admin' })
          .eq('id', existingAdmin.id);

        if (updateError) throw updateError;
        console.log('Ažurirana uloga postojećeg korisnika na admin');
      }
    } else {
      // 2. Kreiramo novog administratora
      const { data: newUser, error: signUpError } =
        await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true
        });

      if (signUpError) throw signUpError;

      console.log('Kreiran novi administratorski nalog');

      // 3. Kreiramo profil za novog administratora
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: newUser.user.id,
          role: 'admin'
        });

      if (insertError) throw insertError;

      console.log('Kreiran administratorski profil');
    }

    console.log('Inicijalizacija administratora uspešno završena');
  } catch (error) {
    console.error('Greška pri inicijalizaciji administratora:', error);
    process.exit(1);
  }
}

initAdmin();
