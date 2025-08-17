-- Fix the overly permissive notes table policy first
DROP POLICY IF EXISTS "Users can manage notes" ON public.notes;

-- Create proper RLS policies for notes table
CREATE POLICY "Users can view notes they created or are related to"
ON public.notes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid() OR
  (
    -- Allow viewing notes related to records the user owns
    has_role(auth.uid(), 'sales_rep'::app_role) AND (
      (related_to_type = 'contact' AND related_to_id IN (
        SELECT id FROM public.contacts WHERE owner_id = auth.uid()
      )) OR
      (related_to_type = 'deal' AND related_to_id IN (
        SELECT id FROM public.deals WHERE assigned_user_id = auth.uid()
      )) OR
      (related_to_type = 'lead' AND related_to_id IN (
        SELECT id FROM public.leads WHERE assigned_user_id = auth.uid()
      )) OR
      (related_to_type = 'company' AND related_to_id IN (
        SELECT id FROM public.companies WHERE assigned_user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can create notes for records they own"
ON public.notes
FOR INSERT
WITH CHECK (
  (created_by = auth.uid()) AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    (
      -- Sales reps can only create notes for records they own
      has_role(auth.uid(), 'sales_rep'::app_role) AND (
        (related_to_type = 'contact' AND related_to_id IN (
          SELECT id FROM public.contacts WHERE owner_id = auth.uid()
        )) OR
        (related_to_type = 'deal' AND related_to_id IN (
          SELECT id FROM public.deals WHERE assigned_user_id = auth.uid()
        )) OR
        (related_to_type = 'lead' AND related_to_id IN (
          SELECT id FROM public.leads WHERE assigned_user_id = auth.uid()
        )) OR
        (related_to_type = 'company' AND related_to_id IN (
          SELECT id FROM public.companies WHERE assigned_user_id = auth.uid()
        ))
      )
    )
  )
);

CREATE POLICY "Users can update their own notes or admins/managers can update any"
ON public.notes
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);

CREATE POLICY "Users can delete their own notes or admins/managers can delete any"
ON public.notes
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  created_by = auth.uid()
);