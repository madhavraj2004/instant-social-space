import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { participant_id, type = 'direct' } = await req.json();

    console.log('Creating chat:', { user_id: user.id, participant_id, type });

    // Check if direct chat already exists between these users
    if (type === 'direct') {
      const { data: existingChats, error: searchError } = await supabase
        .from('chats')
        .select(`
          id,
          type,
          chat_participants!inner(user_id)
        `)
        .eq('type', 'direct');

      if (searchError) {
        console.error('Error searching for existing chat:', searchError);
      } else if (existingChats) {
        // Find a chat where both users are participants
        for (const chat of existingChats) {
          const participants = chat.chat_participants as any[];
          const userIds = participants.map(p => p.user_id);
          
          if (userIds.includes(user.id) && userIds.includes(participant_id) && userIds.length === 2) {
            console.log('Found existing chat:', chat.id);
            return new Response(
              JSON.stringify({ chat_id: chat.id, exists: true }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Create new chat
    const { data: newChat, error: chatError } = await supabase
      .from('chats')
      .insert({ type })
      .select()
      .single();

    if (chatError || !newChat) {
      console.error('Error creating chat:', chatError);
      throw new Error('Failed to create chat');
    }

    console.log('Created new chat:', newChat.id);

    // Add participants
    const participants = [
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: participant_id }
    ];

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      throw new Error('Failed to add participants');
    }

    console.log('Successfully created chat with participants');

    return new Response(
      JSON.stringify({ chat_id: newChat.id, exists: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});