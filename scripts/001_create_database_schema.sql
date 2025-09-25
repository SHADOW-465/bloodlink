-- Blood Donation Platform Database Schema
-- Phase 1: Core MVP Tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blood types enum
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- User roles enum
CREATE TYPE user_role AS ENUM ('donor', 'recipient', 'admin', 'hospital');

-- Request status enum
CREATE TYPE request_status AS ENUM ('active', 'fulfilled', 'cancelled', 'expired');

-- Donation status enum
CREATE TYPE donation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_type blood_type NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  weight DECIMAL(5,2),
  role user_role NOT NULL DEFAULT 'donor',
  
  -- Location data
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Medical information
  medical_conditions TEXT[],
  medications TEXT[],
  last_donation_date DATE,
  is_eligible_to_donate BOOLEAN DEFAULT true,
  next_eligible_date DATE,
  
  -- Rotaract integration
  is_rotaract_member BOOLEAN DEFAULT false,
  rotaract_club_name TEXT,
  rotaract_district TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_documents TEXT[],
  
  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
  privacy_settings JSONB DEFAULT '{"show_location": true, "show_phone": false}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blood requests table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Request details
  blood_type blood_type NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  needed_by TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Patient information
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT CHECK (patient_gender IN ('male', 'female', 'other')),
  medical_condition TEXT,
  
  -- Location
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact information
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  emergency_contact TEXT,
  
  -- Status and metadata
  status request_status DEFAULT 'active',
  description TEXT,
  special_requirements TEXT,
  
  -- Matching preferences
  preferred_donor_gender TEXT CHECK (preferred_donor_gender IN ('male', 'female', 'any')) DEFAULT 'any',
  max_distance_km INTEGER DEFAULT 50,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Donations table (tracks donation responses and completions)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  
  -- Donation details
  units_donated INTEGER DEFAULT 1,
  donation_date TIMESTAMP WITH TIME ZONE,
  status donation_status DEFAULT 'pending',
  
  -- Verification
  otp_code TEXT,
  otp_verified_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT CHECK (verification_method IN ('otp', 'hospital_staff', 'manual')),
  
  -- Location and logistics
  donation_center TEXT,
  donation_address TEXT,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  
  -- Feedback and notes
  donor_notes TEXT,
  recipient_feedback TEXT,
  hospital_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Messages table (for in-app communication)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
  
  -- Message content
  message_text TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'location', 'image', 'system')) DEFAULT 'text',
  
  -- Metadata
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rotaract clubs table
CREATE TABLE IF NOT EXISTS public.rotaract_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_name TEXT NOT NULL UNIQUE,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  
  -- Contact information
  president_name TEXT,
  president_email TEXT,
  president_phone TEXT,
  club_email TEXT,
  
  -- Club details
  charter_date DATE,
  meeting_day TEXT,
  meeting_time TIME,
  meeting_venue TEXT,
  
  -- Statistics
  member_count INTEGER DEFAULT 0,
  total_donations INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blood drives/events table
CREATE TABLE IF NOT EXISTS public.blood_drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.rotaract_clubs(id) ON DELETE SET NULL,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Location
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity and registration
  max_donors INTEGER,
  registered_donors INTEGER DEFAULT 0,
  target_units INTEGER,
  collected_units INTEGER DEFAULT 0,
  
  -- Contact
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blood drive registrations
CREATE TABLE IF NOT EXISTS public.blood_drive_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES public.blood_drives(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Registration details
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferred_time_slot TIME,
  special_requirements TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled')) DEFAULT 'registered',
  attended_at TIMESTAMP WITH TIME ZONE,
  units_donated INTEGER DEFAULT 0,
  
  -- Unique constraint to prevent duplicate registrations
  UNIQUE(drive_id, donor_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('blood_request', 'donation_update', 'drive_reminder', 'system', 'achievement')) NOT NULL,
  
  -- Related entities
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
  drive_id UUID REFERENCES public.blood_drives(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery channels
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  sent_via_push BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements/badges table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Achievement details
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  
  -- Progress tracking
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_blood_type ON public.profiles(blood_type);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_eligible ON public.profiles(is_eligible_to_donate);

CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_type ON public.blood_requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_requests_city ON public.blood_requests(city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON public.blood_requests(urgency_level);
CREATE INDEX IF NOT EXISTS idx_blood_requests_needed_by ON public.blood_requests(needed_by);

CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_request_id ON public.donations(request_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotaract_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_drive_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other verified profiles for matching" ON public.profiles
  FOR SELECT USING (is_verified = true AND role IN ('donor', 'recipient'));

-- RLS Policies for blood_requests
CREATE POLICY "Users can view active blood requests" ON public.blood_requests
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create their own blood requests" ON public.blood_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own blood requests" ON public.blood_requests
  FOR UPDATE USING (auth.uid() = requester_id);

-- RLS Policies for donations
CREATE POLICY "Users can view donations they're involved in" ON public.donations
  FOR SELECT USING (
    auth.uid() = donor_id OR 
    auth.uid() IN (SELECT requester_id FROM public.blood_requests WHERE id = request_id)
  );

CREATE POLICY "Donors can create donation responses" ON public.donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update donations they're involved in" ON public.donations
  FOR UPDATE USING (
    auth.uid() = donor_id OR 
    auth.uid() IN (SELECT requester_id FROM public.blood_requests WHERE id = request_id)
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for rotaract_clubs
CREATE POLICY "Anyone can view rotaract clubs" ON public.rotaract_clubs
  FOR SELECT USING (true);

-- RLS Policies for blood_drives
CREATE POLICY "Anyone can view active blood drives" ON public.blood_drives
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create blood drives" ON public.blood_drives
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their blood drives" ON public.blood_drives
  FOR UPDATE USING (auth.uid() = organizer_id);

-- RLS Policies for blood_drive_registrations
CREATE POLICY "Users can view their own registrations" ON public.blood_drive_registrations
  FOR SELECT USING (auth.uid() = donor_id);

CREATE POLICY "Users can register for blood drives" ON public.blood_drive_registrations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update their own registrations" ON public.blood_drive_registrations
  FOR UPDATE USING (auth.uid() = donor_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rotaract_clubs_updated_at BEFORE UPDATE ON public.rotaract_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_drives_updated_at BEFORE UPDATE ON public.blood_drives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    blood_type,
    city,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data ->> 'blood_type')::blood_type, 'O+'),
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'Chennai'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'donor')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
