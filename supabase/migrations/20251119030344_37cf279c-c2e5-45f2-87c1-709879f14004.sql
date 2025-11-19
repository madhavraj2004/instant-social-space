-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'video/mp4', 'video/quicktime']
);

-- Create RLS policies for chat files storage
CREATE POLICY "Users can view files in their chats"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-files' AND
  EXISTS (
    SELECT 1 FROM chat_participants cp
    INNER JOIN messages m ON m.chat_id = cp.chat_id
    WHERE cp.user_id = auth.uid()
    AND m.file_url LIKE '%' || storage.objects.name
  )
);

CREATE POLICY "Users can upload files to their chats"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own uploaded files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);