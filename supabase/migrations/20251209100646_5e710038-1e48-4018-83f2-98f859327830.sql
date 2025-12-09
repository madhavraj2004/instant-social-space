-- Drop and recreate the insert policy for chats with explicit role
DROP POLICY IF EXISTS "Anyone can create chats" ON public.chats;

CREATE POLICY "Authenticated users can create chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (true);