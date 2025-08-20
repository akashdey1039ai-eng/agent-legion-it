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
import { AlertCircle, Eye, EyeOff, Shield, Lock, Brain, Bot, Sparkles } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/30 border-t-primary mx-auto"></div>
            <Brain className="absolute inset-0 h-6 w-6 text-primary m-auto animate-pulse" />
          </div>
          <p className="mt-4 text-muted-foreground font-medium">Initializing AI Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface relative overflow-hidden p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent to-primary opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-hero opacity-20 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center gap-3 p-4 bg-gradient-card rounded-2xl border border-border/50 shadow-glow backdrop-blur-xl">
            <div className="relative">
              <Brain className="h-10 w-10 text-primary animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-ping" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Universal CRM
              </h1>
              <p className="text-sm text-muted-foreground font-medium">AI Intelligence Platform</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Welcome to the Future of CRM
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Secure access to your AI-powered customer intelligence platform
            </p>
          </div>
        </div>

        {/* Main Auth Card */}
        <Card className="glass-card border-2 border-primary/20 shadow-2xl backdrop-blur-xl bg-gradient-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-3 text-xl">
              <div className="relative">
                <Lock className="h-6 w-6 text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm"></div>
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {isSignUp ? 'Create Account' : 'Secure Access'}
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              {isSignUp 
                ? 'Join thousands using AI-powered CRM intelligence' 
                : 'Enter your credentials to access the AI command center'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs value={isSignUp ? 'signup' : 'signin'} onValueChange={(value) => {
              setIsSignUp(value === 'signup');
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}>
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-surface border border-border/50 shadow-sm">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-smooth font-medium"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all duration-smooth font-medium"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6 mt-8">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      required
                      disabled={isLoading || accountLocked}
                      className="input-premium h-12 text-base border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-smooth"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your secure password"
                        required
                        disabled={isLoading || accountLocked}
                        className="input-premium h-12 text-base pr-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-smooth"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-primary/10 transition-colors duration-smooth"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || accountLocked}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-primary hover:shadow-glow-lg transition-all duration-smooth hover:scale-[1.02] disabled:opacity-50 disabled:scale-100" 
                    disabled={isLoading || accountLocked}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Authenticating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Access Platform
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6 mt-8">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
                      Business Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      required
                      disabled={isLoading}
                      className="input-premium h-12 text-base border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-smooth"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
                      Create Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        required
                        disabled={isLoading}
                        className="input-premium h-12 text-base pr-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-smooth"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-primary/10 transition-colors duration-smooth"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium bg-muted/30 rounded-lg p-2">
                      🔐 Must include uppercase, lowercase, number, and special character
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        className="input-premium h-12 text-base pr-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-smooth"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-primary/10 transition-colors duration-smooth"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-primary hover:shadow-glow-lg transition-all duration-smooth hover:scale-[1.02] disabled:opacity-50 disabled:scale-100" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Join AI Platform
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Security Footer */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-success" />
              <span className="font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Intelligence</span>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-card rounded-xl border border-border/50 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              🚀 Your data is protected with bank-grade encryption
            </p>
            <p className="text-xs text-muted-foreground/80">
              Production-ready platform with SOC 2 compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}