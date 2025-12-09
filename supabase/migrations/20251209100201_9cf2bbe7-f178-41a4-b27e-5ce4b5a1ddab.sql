-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view participants of their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

-- Create a security definer function to get user's chat IDs without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_chat_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT chat_id FROM chat_participants WHERE user_id = user_uuid;
$$;

-- Create simple non-recursive policies for chat_participants
CREATE POLICY "Users can view their own participations"
ON public.chat_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view co-participants"
ON public.chat_participants
FOR SELECT
USING (chat_id IN (SELECT public.get_user_chat_ids(auth.uid())));

CREATE POLICY "Users can add themselves to chats"
ON public.chat_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can add others to chats they belong to"
ON public.chat_participants
FOR INSERT
WITH CHECK (chat_id IN (SELECT public.get_user_chat_ids(auth.uid())));

-- Create simple non-recursive policies for chats
CREATE POLICY "Anyone can create chats"
ON public.chats
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view chats they belong to"
ON public.chats
FOR SELECT
USING (id IN (SELECT public.get_user_chat_ids(auth.uid())));