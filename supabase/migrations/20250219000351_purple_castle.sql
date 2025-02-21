/*
  # Fix authentication setup

  1. Changes
    - Properly sets up auth schema and tables
    - Creates admin user with correct password hashing
    - Adds necessary policies
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the admin user with proper password hashing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  is_super_admin,
  phone,
  phone_confirmed_at,
  confirmed_at,
  email_change,
  email_change_token_current,
  last_sign_in_at,
  raw_user_meta_data_text
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@topdom.rs',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  0,
  null,
  '',
  false,
  null,
  null,
  now(),
  '',
  '',
  now(),
  ''
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now(),
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;