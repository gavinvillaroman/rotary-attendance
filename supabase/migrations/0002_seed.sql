-- Data migration from Airtable → Supabase
-- Source: Rotary base (appjrCXmKfLR6MLGL), 2026-05-12

-- ============================================================
-- Members (52 from RC Cabanatuan North)
-- ============================================================

insert into members (airtable_id, name, title, classification, status, clla_2026_status, clla_2026_amount_paid) values
  ('rec0suoODFvSWGn5a', 'Hernando R. Trinidad Jr.', 'Rotarian', 'Poultry Farming', 'Active', null, null),
  ('rec218RV1Ui9s7HnH', 'Glen Makoy B. Alfonso', 'Rotarian', 'Catering Service', 'Active', null, null),
  ('rec2qu3bmzANd0xd0', 'Jose Mari M. Delos Santos', 'Rotarian', 'Online Gaming', 'Active', null, null),
  ('rec2zEuaMoorJiRTa', 'Reynaldo OL. Odulio Jr.', 'Past President', 'Motorcycle Dealership', 'Active', 'Paid', 2000),
  ('rec3RzCSOuNm9E7eQ', 'Armando S. De Lara', 'Rotarian', 'Manufacturer of Fire Extinguisher', 'Active', 'Confirmed', 0),
  ('rec4v7jQK4AXJtzEC', 'Marion Edrick N. Manuel', 'Rotarian', 'Grocery – Retail', 'Active', null, null),
  ('rec6R7kPpXUR7r9yB', 'Wilson Charles G. Lim', 'Rotarian', 'Cold Roll Forming Plant for Roofing Materials', 'Active', null, null),
  ('rec8PuTAX82ySUTkG', 'Marcos F. Manuel', 'Rotarian', 'Educator', 'Active', 'Paid', 2000),
  ('rec8umT4g6DJJHMAk', 'Noel Buenaventura', 'Rotarian', 'Judge', 'Active', null, null),
  ('rec99dN7CRoPJwboD', 'Alan C. Valmadrid', 'Rotarian', 'Xerox Parts & Services', 'Active', null, null),
  ('rec9czoBaVkdGO4vD', 'Robert W. Chua', 'Rotarian', 'Laboratory and Diagnostic Center', 'Active', 'Paid', 2000),
  ('recAQ8MAxOjJLv4eh', 'Randy R. Corgos', 'Rotarian', 'Renal Technology Specialist', 'Active', null, null),
  ('recFE7RiRhh40mPBL', 'Rico Bong M. Medina', 'Rotarian', 'Tires & Mags Supply', 'Active', 'Paid', 2000),
  ('recFIz65oju9GzSxm', 'Juan Carlo M. Callanga', 'Rotarian', 'Engineer', 'Active', null, null),
  ('recFQXo3lCcMJEKPj', 'Crisanto P. Carlos', 'Rotarian', 'Bookstore', 'Active', null, null),
  ('recFipKp3vty9K2qj', 'Armand De Lara', null, null, 'Active', 'Paid', 3000),
  ('recFoHFNsHNzXHOrY', 'Benjamin Earl V. Hernal', 'Rotarian', 'PhilamLife Senior Executive Mgr.', 'Active', null, null),
  ('recGh506CNRoOHeiV', 'Edwin V. Soriano', 'Rotarian', 'Farming', 'Active', null, null),
  ('recI84aDcJ32POZTw', 'Meynard M. Belena', 'Rotarian', 'Printing Press', 'Active', 'Paid', 2000),
  ('recIAm0FI0L2at0IV', 'Richelle Roy P. Amurao', 'Rotarian', 'Jewellery Shop', 'Active', null, null),
  ('recJaI3JOduYB5Lov', 'Joel B. Dizon', 'Rotarian', 'Coco and Good Lumber Dealer', 'Active', 'Paid', 2000),
  ('recK7pjDGRCKwr2BK', 'Blademer E. Agapito', 'Rotarian', 'Travel Agency', 'Active', null, null),
  ('recKNwEQTUOzXVxSs', 'Elmer T. Torres', 'Rotarian', 'Veterinarian / Pest Control Services', 'Active', 'Paid', 2000),
  ('recMOw5t27dWBqPW4', 'Johan Wahlen Q. Pangilinan', 'President Nominee', 'Race Car – Modification Specialist', 'Active', 'Paid', 2000),
  ('recNM2CpVm3YQrhSE', 'Bembol D. Castillo', 'Rotarian', 'Lawyer', 'Active', null, null),
  ('recPOkIXph0xN0hH2', 'Sherwin C. Rodenas', 'President Nominee', 'Bakery – Cakes & Pastries', 'Active', null, null),
  ('recQbuZLZkBIcl0SG', 'Gavin Chester C. Villaroman', 'Secretary', 'Digital Marketing', 'Active', 'Paid', 2000),
  ('recRDRuTk7VQwTTvU', 'Renato C. Adajar', 'Rotarian', 'Glass/Aluminum Contractor', 'Active', 'Paid', 2000),
  ('recRRz24um9dHSrQm', 'Arthur DG. Tolentino', 'Rotarian', 'Seaman', 'Active', null, null),
  ('recSG2tOFoMWkBFad', 'Romulo A. Angeles Jr.', 'Rotarian', 'School Owner', 'Active', null, null),
  ('recSzAzrMhJ5cWpi4', 'Fredzlander M. Villegas', 'Rotarian', 'Building Design & Construction', 'Active', null, null),
  ('recUht9dswEZKEgdN', 'Larnie James R. Santos', 'President', 'AC Sales and Services', 'Active', 'Paid', 0),
  ('recUvDtJuk5ReuyAo', 'Roderick Joseph P. Beltran', 'Rotarian', 'Carwash & Auto Accessories', 'Active', 'Declined', 0),
  ('recWLRcZgJdyujMWv', 'Virgilio E. Palilio', 'Past President', 'Ricemill', 'Active', 'Declined', 0),
  ('recZ4XvKU3o14Ze4g', 'John Roland S. Quinto', 'Rotarian', 'Laundry Services', 'Active', null, null),
  ('recZOdyQFmYAamP5x', 'Elmer R. Esteban', 'Rotarian', 'Auto Repair Shop', 'Active', 'Paid', 2000),
  ('recZppRjf1RLjsAX8', 'Philip Martin E. Esteban', 'Past President', 'Digital Video and Photography', 'Active', 'Paid', 2000),
  ('recfYtqkk8gfMA41F', 'Joseph V. Ponce', 'Rotarian', 'Non-Life Insurance', 'Active', null, null),
  ('rechTSsmDYkJ3RFnC', 'Jose Maria Ceasar C. San Pedro', 'Rotarian', 'Resort Owner / Event Place', 'Active', null, null),
  ('recibX5KggIsypX0Y', 'Lorenzo G. Sy', 'Rotarian', 'Hardware', 'Active', null, null),
  ('reckC0UjEJf6a485i', 'Omar V. Ching', 'Rotarian', 'General Merchandise', 'Active', 'Paid', 2000),
  ('reckGFTeOxzJd7RYf', 'Renato DC. Reyes Jr.', 'Rotarian', 'Lending Institution', 'Active', null, null),
  ('reclhJqZo2Prm9W29', 'Luwee Karl V. Carrasco', 'Rotarian', 'Events Coordinator', 'Active', 'Paid', 2000),
  ('recm6ZXkMcszpnqNq', 'Aries Vincent Patrick G. Lim', 'Rotarian', 'Grocery Chain / Municipal Mayor', 'Active', null, null),
  ('recmBZYhcHqBYtA0e', 'Gil Dindo O. Berino', 'Past District Governor', 'Educational Institution', 'Active', null, 0),
  ('recndLQGW0dHAGzHy', 'Johnny S. Arita', 'Rotarian', 'Auto Supply', 'Active', null, null),
  ('recq0dKiG8A6Gj5da', 'Frederick F. Ragudo', 'Rotarian', 'Petroleum Hauler', 'Active', null, null),
  ('recqKTPh9DY6i69Cq', 'Ronald G. Bernardo', 'Rotarian', 'Lights and Sounds', 'Active', null, null),
  ('recs6ei9aaRx30My9', 'Dominic C. Tan', 'Rotarian', 'Home Finishing – Improvement Store', 'Active', 'Paid', 2000),
  ('recsa1VzyO0NwQDTN', 'Filamer T. Sanqui', 'Rotarian', 'BDO – Bank Manager', 'Active', null, null),
  ('recvBDuYnGzCCHPuP', 'Franklin A. Payawal III', 'Vice President', 'Advertising', 'Active', 'Confirmed', 0),
  ('recvVuDY6lZY6zh3Y', 'Jeffrey Glenn C. Sado', 'Rotarian', 'Towing Services', 'Active', null, null),
  ('recyJzqCMXcSglr1b', 'Raphael Luias G. Agtay', 'Rotarian', 'Information Technology', 'Active', null, null)
on conflict (airtable_id) do nothing;

-- ============================================================
-- Events
-- ============================================================

insert into events (airtable_id, name, event_date, type, location) values
  ('rec3LgyWflgmEqoDm', 'Strategic Planning', '2026-05-13', 'Board Meeting', 'Oquadro')
on conflict (airtable_id) do nothing;

-- ============================================================
-- Attendance (joined via airtable_id)
-- ============================================================

insert into attendance (airtable_id, event_id, member_id, checked_in_at)
select
  'recQKvT5VctBqQpwF',
  (select id from events where airtable_id = 'rec3LgyWflgmEqoDm'),
  (select id from members where airtable_id = 'recQbuZLZkBIcl0SG'),
  '2026-05-12T13:44:34.107Z'::timestamptz
on conflict (airtable_id) do nothing;

notify pgrst, 'reload schema';
