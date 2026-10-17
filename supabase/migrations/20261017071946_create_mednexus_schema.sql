/*
# Create MedNexus database schema

## Overview
Creates the complete database for the Barangay San Pedro Health Center Management System (MEDNEXUS).
This is a single-tenant app — one health center — so all data is shared and accessible
to the anon-key frontend. No auth.uid() ownership scoping is used.

## New Tables

1. **residents** — Registered residents of the barangay with personal info, address, classification, and account credentials.
2. **consultations** — Clinical consultation records linked to a resident, including complaint, assessment, diagnosis, treatment, and follow-up.
3. **prescriptions** — Prescription records linked to a resident; medicines stored as a JSONB array of medication lines.
4. **medicines** — Medicine inventory items with stock levels, expiration, and batch info.
5. **messages** — Chat messages between BHW and residents, with optional image attachment.
6. **announcements** — Health center announcements with optional image.
7. **health_records** — Resident health records with vitals, history, conditions, allergies.
8. **bhw_profile** — Single-row table for the Barangay Health Worker profile.
9. **center_info** — Single-row table for health center information (overview, mission, hours, services).

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because this is a single-tenant shared-data app with no Supabase auth sign-in.
- Every table gets 4 policies: SELECT, INSERT, UPDATE, DELETE.

## Important Notes
1. Prescription medicines are stored as JSONB (array of medication lines) to preserve the existing data shape.
2. Center info services are stored as JSONB (array of strings).
3. The `bhw_profile` and `center_info` tables are constrained to a single row via a unique index on a fixed boolean column.
4. Resident passwords are stored as text to match the existing prototype behavior (plaintext). This should be upgraded to hashed storage when Supabase auth is integrated.
*/

-- ===== RESIDENTS =====
CREATE TABLE IF NOT EXISTS residents (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  middle_name text NOT NULL DEFAULT '',
  last_name text NOT NULL,
  birth_date date,
  sex text NOT NULL DEFAULT '',
  civil_status text NOT NULL DEFAULT '',
  sitio text NOT NULL DEFAULT '',
  house text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  mobile text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  classification text NOT NULL DEFAULT 'Normal Resident',
  username text NOT NULL,
  password text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  photo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_residents" ON residents;
CREATE POLICY "anon_select_residents" ON residents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_residents" ON residents;
CREATE POLICY "anon_insert_residents" ON residents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_residents" ON residents;
CREATE POLICY "anon_update_residents" ON residents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_residents" ON residents;
CREATE POLICY "anon_delete_residents" ON residents FOR DELETE
  TO anon, authenticated USING (true);

-- ===== CONSULTATIONS =====
CREATE TABLE IF NOT EXISTS consultations (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  date date,
  consultation_type text NOT NULL DEFAULT '',
  encounter_type text NOT NULL DEFAULT '',
  assigned_bhw text NOT NULL DEFAULT '',
  personnel text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  chief_complaint text NOT NULL DEFAULT '',
  onset text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT '',
  symptoms text NOT NULL DEFAULT '',
  history text NOT NULL DEFAULT '',
  findings text NOT NULL DEFAULT '',
  assessment text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  treatment text NOT NULL DEFAULT '',
  home_care text NOT NULL DEFAULT '',
  advice text NOT NULL DEFAULT '',
  warning_signs text NOT NULL DEFAULT '',
  follow_up_date date,
  follow_up_type text NOT NULL DEFAULT '',
  referral text NOT NULL DEFAULT '',
  referral_status text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Draft',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_consultations" ON consultations;
CREATE POLICY "anon_select_consultations" ON consultations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
CREATE POLICY "anon_insert_consultations" ON consultations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_consultations" ON consultations;
CREATE POLICY "anon_update_consultations" ON consultations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_consultations" ON consultations;
CREATE POLICY "anon_delete_consultations" ON consultations FOR DELETE
  TO anon, authenticated USING (true);

-- ===== PRESCRIPTIONS =====
CREATE TABLE IF NOT EXISTS prescriptions (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  date date,
  diagnosis text NOT NULL DEFAULT '',
  prescriber text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  follow_up_date date,
  notes text NOT NULL DEFAULT '',
  medicines jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Draft',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_prescriptions" ON prescriptions;
CREATE POLICY "anon_select_prescriptions" ON prescriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_prescriptions" ON prescriptions;
CREATE POLICY "anon_insert_prescriptions" ON prescriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_prescriptions" ON prescriptions;
CREATE POLICY "anon_update_prescriptions" ON prescriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_prescriptions" ON prescriptions;
CREATE POLICY "anon_delete_prescriptions" ON prescriptions FOR DELETE
  TO anon, authenticated USING (true);

-- ===== MEDICINES (INVENTORY) =====
CREATE TABLE IF NOT EXISTS medicines (
  id text PRIMARY KEY,
  name text NOT NULL,
  generic text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  strength text NOT NULL DEFAULT '',
  form text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  minimum integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  expiration date,
  batch text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medicines" ON medicines;
CREATE POLICY "anon_select_medicines" ON medicines FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_medicines" ON medicines;
CREATE POLICY "anon_insert_medicines" ON medicines FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_medicines" ON medicines;
CREATE POLICY "anon_update_medicines" ON medicines FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_medicines" ON medicines;
CREATE POLICY "anon_delete_medicines" ON medicines FOR DELETE
  TO anon, authenticated USING (true);

-- ===== MESSAGES =====
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'bhw',
  text text NOT NULL DEFAULT '',
  at timestamptz NOT NULL DEFAULT now(),
  image text
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

-- ===== ANNOUNCEMENTS =====
CREATE TABLE IF NOT EXISTS announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  date date,
  status text NOT NULL DEFAULT 'Draft',
  image text
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_announcements" ON announcements;
CREATE POLICY "anon_select_announcements" ON announcements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_announcements" ON announcements;
CREATE POLICY "anon_insert_announcements" ON announcements FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_announcements" ON announcements;
CREATE POLICY "anon_update_announcements" ON announcements FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_announcements" ON announcements;
CREATE POLICY "anon_delete_announcements" ON announcements FOR DELETE
  TO anon, authenticated USING (true);

-- ===== HEALTH RECORDS =====
CREATE TABLE IF NOT EXISTS health_records (
  id text PRIMARY KEY,
  resident_id text NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  date date,
  blood_pressure text NOT NULL DEFAULT '',
  pulse text NOT NULL DEFAULT '',
  respiratory text NOT NULL DEFAULT '',
  temperature text NOT NULL DEFAULT '',
  oxygen text NOT NULL DEFAULT '',
  height text NOT NULL DEFAULT '',
  weight text NOT NULL DEFAULT '',
  history text NOT NULL DEFAULT '',
  conditions text NOT NULL DEFAULT '',
  allergies text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT ''
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_health_records" ON health_records;
CREATE POLICY "anon_select_health_records" ON health_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_health_records" ON health_records;
CREATE POLICY "anon_insert_health_records" ON health_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_health_records" ON health_records;
CREATE POLICY "anon_update_health_records" ON health_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_health_records" ON health_records;
CREATE POLICY "anon_delete_health_records" ON health_records FOR DELETE
  TO anon, authenticated USING (true);

-- ===== BHW PROFILE (single row) =====
CREATE TABLE IF NOT EXISTS bhw_profile (
  id boolean PRIMARY KEY DEFAULT true,
  name text NOT NULL DEFAULT 'Barangay Health Worker',
  contact text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT 'bhw2026',
  photo text,
  CONSTRAINT single_row CHECK (id = true)
);

ALTER TABLE bhw_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bhw_profile" ON bhw_profile;
CREATE POLICY "anon_select_bhw_profile" ON bhw_profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bhw_profile" ON bhw_profile;
CREATE POLICY "anon_insert_bhw_profile" ON bhw_profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bhw_profile" ON bhw_profile;
CREATE POLICY "anon_update_bhw_profile" ON bhw_profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bhw_profile" ON bhw_profile;
CREATE POLICY "anon_delete_bhw_profile" ON bhw_profile FOR DELETE
  TO anon, authenticated USING (true);

-- ===== CENTER INFO (single row) =====
CREATE TABLE IF NOT EXISTS center_info (
  id boolean PRIMARY KEY DEFAULT true,
  overview text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  hours text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  image text,
  CONSTRAINT single_row CHECK (id = true)
);

ALTER TABLE center_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_center_info" ON center_info;
CREATE POLICY "anon_select_center_info" ON center_info FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_center_info" ON center_info;
CREATE POLICY "anon_insert_center_info" ON center_info FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_center_info" ON center_info;
CREATE POLICY "anon_update_center_info" ON center_info FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_center_info" ON center_info;
CREATE POLICY "anon_delete_center_info" ON center_info FOR DELETE
  TO anon, authenticated USING (true);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_consultations_resident ON consultations(resident_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_resident ON prescriptions(resident_id);
CREATE INDEX IF NOT EXISTS idx_health_records_resident ON health_records(resident_id);
CREATE INDEX IF NOT EXISTS idx_messages_resident ON messages(resident_id);
CREATE INDEX IF NOT EXISTS idx_residents_sitio ON residents(sitio);
CREATE INDEX IF NOT EXISTS idx_residents_classification ON residents(classification);

-- ===== SEED DEFAULT ROWS =====
INSERT INTO bhw_profile (id, name, contact, username)
VALUES (true, 'Barangay Health Worker', '', 'bhw2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO center_info (id, overview, mission, hours, contact, services)
VALUES (
  true,
  'The Barangay San Pedro Health Center coordinates preventive care, health monitoring, consultations and essential medicine support through MEDNEXUS.',
  'To provide accessible, organized and compassionate primary health services to every resident of Barangay San Pedro.',
  'Monday–Friday, 8:00 AM–5:00 PM',
  'Barangay San Pedro Health Center',
  '["Resident Health Records","Maternal & Infant Care","Consultations & Follow-ups","Medicine Dispensing","Health Education","Community Announcements"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
