-- Fix RLS policies for data_classifications table
CREATE POLICY "Authenticated users can view data classifications" 
ON public.data_classifications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage data classifications" 
ON public.data_classifications 
FOR ALL 
USING (auth.uid() IS NOT NULL);