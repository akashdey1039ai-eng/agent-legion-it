import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityContext } from '@/components/SecurityProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, Eye, EyeOff, Shield, Lock } from 'lucide-react';

// Clean up auth state utility
const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { validateInput, sanitizeInput, checkRateLimit, logSecurityEvent } = useSecurityContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);

  // Enhanced password validation
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { 
        isValid: false, 
        message: 'Password must include uppercase, lowercase, number, and special character' 
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Check for account lockout
  useEffect(() => {
    const lockoutData = localStorage.getItem('auth_lockout');
    if (lockoutData) {
      const { timestamp, attempts } = JSON.parse(lockoutData);
      const now = Date.now();
      const lockoutDuration = Math.min(attempts * 60000, 900000); // Max 15 minutes
      
      if (now - timestamp < lockoutDuration) {
        setAccountLocked(true);
        setLoginAttempts(attempts);
        const remainingTime = Math.ceil((lockoutDuration - (now - timestamp)) / 60000);
        setError(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
      } else {
        localStorage.removeItem('auth_lockout');
      }
    }
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLockout = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      const lockoutData = {
        timestamp: Date.now(),
        attempts: newAttempts
      };
      localStorage.setItem('auth_lockout', JSON.stringify(lockoutData));
      setAccountLocked(true);
      
      const lockoutDuration = Math.min(newAttempts, 15);
      setError(`Too many failed attempts. Account locked for ${lockoutDuration} minutes.`);
      
      logSecurityEvent('ACCOUNT_LOCKED', { attempts: newAttempts, email });
    } else {
      setError(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountLocked) {
      setError('Account is temporarily locked. Please try again later.');
      return;
    }

    if (!checkRateLimit('signin')) {
      setError('Too many requests. Please wait a moment.');
      return;
    }

    if (!validateInput(email, 'email')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Clean up any existing state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      logSecurityEvent('SIGNIN_ATTEMPT', { email: sanitizeInput(email) });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });

      if (error) {
        handleLockout();
        logSecurityEvent('SIGNIN_FAILED', { 
          email: sanitizeInput(email), 
          error: error.message,
          attempts: loginAttempts + 1
        });
        throw error;
      }

      if (data.user) {
        // Clear lockout data on successful login
        localStorage.removeItem('auth_lockout');
        setLoginAttempts(0);
        
        logSecurityEvent('SIGNIN_SUCCESS', { 
          userId: data.user.id,
          email: sanitizeInput(email)
        });
        
        toast.success('Welcome back! Signed in successfully.');
        
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkRateLimit('signup')) {
      setError('Too many requests. Please wait a moment.');
      return;
    }

    if (!validateInput(email, 'email')) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Clean up any existing state before signing up
      cleanupAuthState();
      
      logSecurityEvent('SIGNUP_ATTEMPT', { email: sanitizeInput(email) });

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeInput(email),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        logSecurityEvent('SIGNUP_FAILED', { 
          email: sanitizeInput(email), 
          error: error.message 
        });
        throw error;
      }

      if (data.user) {
        logSecurityEvent('SIGNUP_SUCCESS', { 
          userId: data.user.id,
          email: sanitizeInput(email)
        });
        
        toast.success('Account created! Please check your email to verify your account.');
        setIsSignUp(false); // Switch to sign in tab
      }
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">IT AI Command Center</h1>
          </div>
          <p className="text-muted-foreground">
            Secure access to your CRM and AI management platform
          </p>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Join the secure AI-powered CRM platform' 
                : 'Access your secure dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => {
              setIsSignUp(value === 'signup');
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading || accountLocked}
                      className="transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading || accountLocked}
                        className="pr-10 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || accountLocked}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || accountLocked}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                      className="transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                        disabled={isLoading}
                        className="pr-10 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must include uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        className="pr-10 transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Your data is protected with enterprise-grade security
          </p>
          <p className="text-xs">
            Demo Environment - For testing purposes only
          </p>
        </div>
      </div>
    </div>
  );
}