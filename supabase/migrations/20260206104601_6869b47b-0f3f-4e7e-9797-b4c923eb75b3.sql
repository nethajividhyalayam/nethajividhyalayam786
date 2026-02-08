
-- Create admission applications table
CREATE TABLE public.admission_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  address TEXT NOT NULL,
  standard_applying TEXT NOT NULL,
  previous_school TEXT,
  blood_group TEXT,
  nationality TEXT DEFAULT 'Indian',
  religion TEXT,
  community TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public application form)
CREATE POLICY "Anyone can submit applications"
ON public.admission_applications
FOR INSERT
WITH CHECK (true);

-- Only authenticated users (admins) can view
CREATE POLICY "Authenticated users can view applications"
ON public.admission_applications
FOR SELECT
TO authenticated
USING (true);
