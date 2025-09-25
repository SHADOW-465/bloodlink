-- Sample data for blood donation platform
-- This script adds sample Rotaract clubs and some test data

-- Insert sample Rotaract clubs
INSERT INTO public.rotaract_clubs (
  club_name,
  district,
  city,
  president_name,
  president_email,
  president_phone,
  club_email,
  charter_date,
  meeting_day,
  meeting_time,
  meeting_venue,
  member_count
) VALUES 
(
  'Rotaract Club of Chennai Central',
  'RID 3233',
  'Chennai',
  'Priya Sharma',
  'president@rccchennaicentral.org',
  '+91 9876543210',
  'info@rccchennaicentral.org',
  '2015-07-15',
  'Saturday',
  '18:00:00',
  'Hotel Savera, Chennai',
  45
),
(
  'Rotaract Club of Chennai East',
  'RID 3233',
  'Chennai',
  'Arjun Kumar',
  'president@rccchennaieast.org',
  '+91 9876543211',
  'info@rccchennaieast.org',
  '2012-03-20',
  'Sunday',
  '17:30:00',
  'ITC Grand Chola, Chennai',
  38
),
(
  'Rotaract Club of Coimbatore',
  'RID 3234',
  'Coimbatore',
  'Meera Patel',
  'president@rcccoimbatore.org',
  '+91 9876543212',
  'info@rcccoimbatore.org',
  '2018-11-10',
  'Saturday',
  '19:00:00',
  'Hotel Le Meridien, Coimbatore',
  52
),
(
  'Rotaract Club of Madurai',
  'RID 3234',
  'Madurai',
  'Karthik Raj',
  'president@rccmadurai.org',
  '+91 9876543213',
  'info@rccmadurai.org',
  '2016-09-05',
  'Friday',
  '18:30:00',
  'Heritage Madurai, Madurai',
  29
);

-- Insert sample blood drive events
INSERT INTO public.blood_drives (
  organizer_id,
  club_id,
  title,
  description,
  event_date,
  start_time,
  end_time,
  venue_name,
  venue_address,
  city,
  pincode,
  max_donors,
  target_units,
  contact_person,
  contact_phone,
  is_featured
) VALUES 
(
  (SELECT id FROM public.rotaract_clubs WHERE club_name = 'Rotaract Club of Chennai Central' LIMIT 1),
  (SELECT id FROM public.rotaract_clubs WHERE club_name = 'Rotaract Club of Chennai Central' LIMIT 1),
  'Life Saver Blood Drive 2025',
  'Join us for our annual blood donation drive to help save lives in our community. Free health checkup and refreshments provided.',
  '2025-02-15',
  '09:00:00',
  '17:00:00',
  'Phoenix MarketCity',
  '142, Velachery Main Rd, Velachery, Chennai',
  'Chennai',
  '600042',
  100,
  150,
  'Priya Sharma',
  '+91 9876543210',
  true
),
(
  (SELECT id FROM public.rotaract_clubs WHERE club_name = 'Rotaract Club of Coimbatore' LIMIT 1),
  (SELECT id FROM public.rotaract_clubs WHERE club_name = 'Rotaract Club of Coimbatore' LIMIT 1),
  'Hope for Life Blood Donation Camp',
  'Emergency blood collection drive to support local hospitals during the festival season.',
  '2025-02-28',
  '08:00:00',
  '16:00:00',
  'Brookefields Mall',
  '1st Floor, 147, Avinashi Rd, Coimbatore',
  'Coimbatore',
  '641037',
  75,
  100,
  'Meera Patel',
  '+91 9876543212',
  true
);

-- Insert sample achievement types
INSERT INTO public.user_achievements (
  user_id,
  achievement_type,
  achievement_name,
  description,
  badge_icon,
  target_progress,
  is_completed
) VALUES 
-- These will be template achievements that can be copied for users
(
  '00000000-0000-0000-0000-000000000000', -- Template ID
  'first_donation',
  'First Drop',
  'Completed your first blood donation',
  '🩸',
  1,
  false
),
(
  '00000000-0000-0000-0000-000000000000',
  'regular_donor',
  'Life Saver',
  'Donated blood 5 times',
  '❤️',
  5,
  false
),
(
  '00000000-0000-0000-0000-000000000000',
  'super_donor',
  'Hero',
  'Donated blood 10 times',
  '🦸',
  10,
  false
),
(
  '00000000-0000-0000-0000-000000000000',
  'emergency_responder',
  'Emergency Hero',
  'Responded to 3 emergency blood requests',
  '🚨',
  3,
  false
),
(
  '00000000-0000-0000-0000-000000000000',
  'community_champion',
  'Community Champion',
  'Organized a blood drive event',
  '🏆',
  1,
  false
);
