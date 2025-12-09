-- Drop problematic policies
DROP POLICY IF EXISTS "Users can add chat participants " ON chat_participants;
DROP POLICY IF EXISTS "Users can view chat participants " ON chat_participants;
DROP POLICY IF EXISTS "Users can view chats they participate in " ON chats;

-- Recreate simpler, non-recursive policies for chat_participants
CREATE POLICY "Users can add themselves as participants"
ON chat_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view participants of their chats"
ON chat_participants FOR SELECT
USING (
  chat_id IN (
    SELECT cp.chat_id FROM chat_participants cp WHERE cp.user_id = auth.uid()
  )
);

-- Recreate chats SELECT policy without recursion
CREATE POLICY "Users can view their chats"
ON chats FOR SELECT
USING (
  id IN (
    SELECT cp.chat_id FROM chat_participants cp WHERE cp.user_id = auth.uid()
  )
);