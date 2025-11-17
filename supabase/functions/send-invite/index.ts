import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviterName }: InviteRequest = await req.json();

    if (!email || !inviterName) {
      return new Response(
        JSON.stringify({ error: "Email and inviter name are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const appUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "");
    const inviteLink = `${appUrl}/register`;

    const emailResponse = await resend.emails.send({
      from: "Chat App <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to join Chat App!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're invited to Chat App!</h1>
          <p style="font-size: 16px; color: #555;">
            ${inviterName} has invited you to join our chat application.
          </p>
          <p style="font-size: 16px; color: #555;">
            Click the button below to create your account and start chatting:
          </p>
          <a href="${inviteLink}" 
             style="display: inline-block; background-color: #4F46E5; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                    margin: 20px 0; font-weight: bold;">
            Join Chat App
          </a>
          <p style="font-size: 14px; color: #888;">
            Or copy this link: ${inviteLink}
          </p>
        </div>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
