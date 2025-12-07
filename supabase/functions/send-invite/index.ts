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

    const loginLink = "https://instant-social-space.vercel.app/login";
    const registerLink = "https://instant-social-space.vercel.app/register";

    const emailResponse = await resend.emails.send({
      from: "Chat App <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName} invited you to join Chat App!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">You're Invited! 🎉</h1>
          <p style="font-size: 16px; color: #555; text-align: center;">
            <strong>${inviterName}</strong> has invited you to join our chat application.
          </p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 16px; text-align: center;">
              <strong>Already have an account?</strong>
            </p>
            <div style="text-align: center;">
              <a href="${loginLink}" 
                 style="display: inline-block; background-color: #4F46E5; color: white; 
                        padding: 12px 32px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                Sign In
              </a>
            </div>
          </div>
          
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="font-size: 16px; color: #333; margin-bottom: 16px; text-align: center;">
              <strong>New to Chat App?</strong>
            </p>
            <div style="text-align: center;">
              <a href="${registerLink}" 
                 style="display: inline-block; background-color: #16a34a; color: white; 
                        padding: 12px 32px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                Create Account
              </a>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 24px;">
            Links:<br/>
            Sign In: ${loginLink}<br/>
            Create Account: ${registerLink}
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
