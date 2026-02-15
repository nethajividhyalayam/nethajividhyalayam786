-- Add a permissive SELECT policy so the public fee payment form can look up students
CREATE POLICY "Public can view students for fee verification"
ON public.students
FOR SELECT
USING (true);
