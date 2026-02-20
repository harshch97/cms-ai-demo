-- Migration: 004_seed_reference_data
-- Seeds state and city reference data with correct state-city relationships.
-- Uses ON CONFLICT DO NOTHING so re-runs are fully idempotent.
-- States are inserted first; cities use a subquery to resolve state_id by name.

-- ── 1. States ────────────────────────────────────────────────────────────────

INSERT INTO states (name) VALUES
  ('Andhra Pradesh'),
  ('Arunachal Pradesh'),
  ('Assam'),
  ('Bihar'),
  ('Chhattisgarh'),
  ('Goa'),
  ('Gujarat'),
  ('Haryana'),
  ('Himachal Pradesh'),
  ('Jharkhand'),
  ('Karnataka'),
  ('Kerala'),
  ('Madhya Pradesh'),
  ('Maharashtra'),
  ('Manipur'),
  ('Meghalaya'),
  ('Mizoram'),
  ('Nagaland'),
  ('Odisha'),
  ('Punjab'),
  ('Rajasthan'),
  ('Sikkim'),
  ('Tamil Nadu'),
  ('Telangana'),
  ('Tripura'),
  ('Uttar Pradesh'),
  ('Uttarakhand'),
  ('West Bengal'),
  ('Andaman and Nicobar Islands'),
  ('Chandigarh'),
  ('Dadra and Nagar Haveli and Daman and Diu'),
  ('Delhi'),
  ('Jammu and Kashmir'),
  ('Ladakh'),
  ('Lakshadweep'),
  ('Puducherry')
ON CONFLICT (name) DO NOTHING;

-- ── 2. Cities (state_id resolved via subquery on state name) ─────────────────

-- Andhra Pradesh
INSERT INTO cities (name, state_id) SELECT 'Vijayawada',          id FROM states WHERE name = 'Andhra Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Visakhapatnam',       id FROM states WHERE name = 'Andhra Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Tirupati',            id FROM states WHERE name = 'Andhra Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Guntur',              id FROM states WHERE name = 'Andhra Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;

-- Assam
INSERT INTO cities (name, state_id) SELECT 'Guwahati',            id FROM states WHERE name = 'Assam'            ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Dibrugarh',           id FROM states WHERE name = 'Assam'            ON CONFLICT (name, state_id) DO NOTHING;

-- Bihar
INSERT INTO cities (name, state_id) SELECT 'Patna',               id FROM states WHERE name = 'Bihar'            ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Gaya',                id FROM states WHERE name = 'Bihar'            ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Muzaffarpur',         id FROM states WHERE name = 'Bihar'            ON CONFLICT (name, state_id) DO NOTHING;

-- Chhattisgarh
INSERT INTO cities (name, state_id) SELECT 'Raipur',              id FROM states WHERE name = 'Chhattisgarh'     ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Bhilai',              id FROM states WHERE name = 'Chhattisgarh'     ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Bilaspur',            id FROM states WHERE name = 'Chhattisgarh'     ON CONFLICT (name, state_id) DO NOTHING;

-- Chandigarh (UT)
INSERT INTO cities (name, state_id) SELECT 'Chandigarh',          id FROM states WHERE name = 'Chandigarh'       ON CONFLICT (name, state_id) DO NOTHING;

-- Delhi
INSERT INTO cities (name, state_id) SELECT 'Delhi',               id FROM states WHERE name = 'Delhi'            ON CONFLICT (name, state_id) DO NOTHING;

-- Goa
INSERT INTO cities (name, state_id) SELECT 'Panaji',              id FROM states WHERE name = 'Goa'              ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Margao',              id FROM states WHERE name = 'Goa'              ON CONFLICT (name, state_id) DO NOTHING;

-- Gujarat
INSERT INTO cities (name, state_id) SELECT 'Ahmedabad',           id FROM states WHERE name = 'Gujarat'          ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Surat',               id FROM states WHERE name = 'Gujarat'          ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Vadodara',            id FROM states WHERE name = 'Gujarat'          ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Rajkot',              id FROM states WHERE name = 'Gujarat'          ON CONFLICT (name, state_id) DO NOTHING;

-- Haryana
INSERT INTO cities (name, state_id) SELECT 'Gurgaon',             id FROM states WHERE name = 'Haryana'          ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Faridabad',           id FROM states WHERE name = 'Haryana'          ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Ambala',              id FROM states WHERE name = 'Haryana'          ON CONFLICT (name, state_id) DO NOTHING;

-- Himachal Pradesh
INSERT INTO cities (name, state_id) SELECT 'Shimla',              id FROM states WHERE name = 'Himachal Pradesh' ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Dharamshala',         id FROM states WHERE name = 'Himachal Pradesh' ON CONFLICT (name, state_id) DO NOTHING;

-- Jammu and Kashmir
INSERT INTO cities (name, state_id) SELECT 'Srinagar',            id FROM states WHERE name = 'Jammu and Kashmir' ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Jammu',               id FROM states WHERE name = 'Jammu and Kashmir' ON CONFLICT (name, state_id) DO NOTHING;

-- Jharkhand
INSERT INTO cities (name, state_id) SELECT 'Ranchi',              id FROM states WHERE name = 'Jharkhand'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Jamshedpur',          id FROM states WHERE name = 'Jharkhand'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Dhanbad',             id FROM states WHERE name = 'Jharkhand'        ON CONFLICT (name, state_id) DO NOTHING;

-- Karnataka
INSERT INTO cities (name, state_id) SELECT 'Bangalore',           id FROM states WHERE name = 'Karnataka'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Mysore',              id FROM states WHERE name = 'Karnataka'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Mangalore',           id FROM states WHERE name = 'Karnataka'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Hubli',               id FROM states WHERE name = 'Karnataka'        ON CONFLICT (name, state_id) DO NOTHING;

-- Kerala
INSERT INTO cities (name, state_id) SELECT 'Thiruvananthapuram',  id FROM states WHERE name = 'Kerala'           ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Kochi',               id FROM states WHERE name = 'Kerala'           ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Kozhikode',           id FROM states WHERE name = 'Kerala'           ON CONFLICT (name, state_id) DO NOTHING;

-- Madhya Pradesh
INSERT INTO cities (name, state_id) SELECT 'Bhopal',              id FROM states WHERE name = 'Madhya Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Indore',              id FROM states WHERE name = 'Madhya Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Jabalpur',            id FROM states WHERE name = 'Madhya Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Gwalior',             id FROM states WHERE name = 'Madhya Pradesh'   ON CONFLICT (name, state_id) DO NOTHING;

-- Maharashtra
INSERT INTO cities (name, state_id) SELECT 'Mumbai',              id FROM states WHERE name = 'Maharashtra'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Pune',                id FROM states WHERE name = 'Maharashtra'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Nagpur',              id FROM states WHERE name = 'Maharashtra'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Nashik',              id FROM states WHERE name = 'Maharashtra'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Aurangabad',          id FROM states WHERE name = 'Maharashtra'      ON CONFLICT (name, state_id) DO NOTHING;

-- Odisha
INSERT INTO cities (name, state_id) SELECT 'Bhubaneswar',         id FROM states WHERE name = 'Odisha'           ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Cuttack',             id FROM states WHERE name = 'Odisha'           ON CONFLICT (name, state_id) DO NOTHING;

-- Punjab
INSERT INTO cities (name, state_id) SELECT 'Amritsar',            id FROM states WHERE name = 'Punjab'           ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Ludhiana',            id FROM states WHERE name = 'Punjab'           ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Jalandhar',           id FROM states WHERE name = 'Punjab'           ON CONFLICT (name, state_id) DO NOTHING;

-- Rajasthan
INSERT INTO cities (name, state_id) SELECT 'Jaipur',              id FROM states WHERE name = 'Rajasthan'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Jodhpur',             id FROM states WHERE name = 'Rajasthan'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Udaipur',             id FROM states WHERE name = 'Rajasthan'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Kota',                id FROM states WHERE name = 'Rajasthan'        ON CONFLICT (name, state_id) DO NOTHING;

-- Tamil Nadu
INSERT INTO cities (name, state_id) SELECT 'Chennai',             id FROM states WHERE name = 'Tamil Nadu'       ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Coimbatore',          id FROM states WHERE name = 'Tamil Nadu'       ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Madurai',             id FROM states WHERE name = 'Tamil Nadu'       ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Salem',               id FROM states WHERE name = 'Tamil Nadu'       ON CONFLICT (name, state_id) DO NOTHING;

-- Telangana
INSERT INTO cities (name, state_id) SELECT 'Hyderabad',           id FROM states WHERE name = 'Telangana'        ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Warangal',            id FROM states WHERE name = 'Telangana'        ON CONFLICT (name, state_id) DO NOTHING;

-- Uttar Pradesh
INSERT INTO cities (name, state_id) SELECT 'Lucknow',             id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Agra',                id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Kanpur',              id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Varanasi',            id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Ghaziabad',           id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Noida',               id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Meerut',              id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Allahabad',           id FROM states WHERE name = 'Uttar Pradesh'    ON CONFLICT (name, state_id) DO NOTHING;

-- Uttarakhand
INSERT INTO cities (name, state_id) SELECT 'Dehradun',            id FROM states WHERE name = 'Uttarakhand'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Haridwar',            id FROM states WHERE name = 'Uttarakhand'      ON CONFLICT (name, state_id) DO NOTHING;

-- West Bengal
INSERT INTO cities (name, state_id) SELECT 'Kolkata',             id FROM states WHERE name = 'West Bengal'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Howrah',              id FROM states WHERE name = 'West Bengal'      ON CONFLICT (name, state_id) DO NOTHING;
INSERT INTO cities (name, state_id) SELECT 'Durgapur',            id FROM states WHERE name = 'West Bengal'      ON CONFLICT (name, state_id) DO NOTHING;
