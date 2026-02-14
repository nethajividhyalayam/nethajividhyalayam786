
-- Table for fee payment submissions from parents awaiting approval
CREATE TABLE public.pending_fee_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  standard TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  amount TEXT,
  payment_method TEXT NOT NULL DEFAULT 'UPI (GPay/PhonePe/Paytm)',
  reference_id TEXT NOT NULL,
  parent_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_fee_payments ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (public form)
CREATE POLICY "Anyone can submit fee payment"
ON public.pending_fee_payments
FOR INSERT
WITH CHECK (true);

-- Authenticated staff/admin can view all
CREATE POLICY "Staff and admin can view pending payments"
ON public.pending_fee_payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Staff and admin can update (approve/reject)
CREATE POLICY "Staff and admin can update pending payments"
ON public.pending_fee_payments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));
