import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Camera, Lock, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const profileSchema = z.object({
  displayName: z.string().trim().min(1, { message: "Display name is required" }).max(100),
  avatarUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal(''))
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfileSettings = () => {
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setEmail(session.user.email || '');

      // Fetch profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || '');
        setAvatarUrl(profile.avatar_url || '');
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      const validatedData = profileSchema.parse({ displayName, avatarUrl: avatarUrl || undefined });

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in to update your profile',
          variant: 'destructive'
        });
        return;
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: validatedData.displayName,
          avatar_url: validatedData.avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      // Also update auth metadata
      await supabase.auth.updateUser({
        data: {
          display_name: validatedData.displayName,
          avatar_url: validatedData.avatarUrl
        }
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully!'
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive'
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    try {
      passwordSchema.parse({ newPassword, confirmPassword });

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: 'Success',
        description: 'Password updated successfully!'
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update password',
          variant: 'destructive'
        });
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your display name and avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xl">
                      {displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                    <Camera className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{displayName || 'No name set'}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isProfileLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    disabled={isProfileLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to an image for your avatar
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isProfileLoading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isProfileLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPasswordLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPasswordLoading}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>

              <Button type="submit" disabled={isPasswordLoading || !newPassword || !confirmPassword} className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                {isPasswordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
