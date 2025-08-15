import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  encryptSensitiveData: (data: any) => string;
  decryptSensitiveData: (encryptedData: string) => any;
  logSecurityEvent: (event: string, details?: any) => void;
  validateInput: (input: string, type: 'email' | 'phone' | 'text') => boolean;
  isProduction: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProduction] = useState(() => {
    return window.location.hostname !== 'localhost' && !window.location.hostname.includes('lovableproject.com');
  });

  // Simple encryption for sensitive data display (not for storage - use Supabase encryption)
  const encryptSensitiveData = (data: any): string => {
    try {
      return btoa(JSON.stringify(data));
    } catch {
      return '';
    }
  };

  const decryptSensitiveData = (encryptedData: string): any => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return null;
    }
  };

  // Log security events for audit trail
  const logSecurityEvent = async (event: string, details?: any) => {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        table_name: 'security_events',
        operation: 'SECURITY_LOG',
        new_data: {
          event,
          details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ip_address: 'client_side' // Server-side logging should capture real IP
        }
      });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security logging error:', error);
    }
  };

  // Input validation with XSS protection
  const validateInput = (input: string, type: 'email' | 'phone' | 'text'): boolean => {
    // Basic XSS prevention
    const xssPattern = /<script|javascript:|on\w+=/i;
    if (xssPattern.test(input)) {
      logSecurityEvent('XSS_ATTEMPT', { input: input.substring(0, 100) });
      return false;
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) && input.length <= 254;
      
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        return phoneRegex.test(input);
      
      case 'text':
        return input.length <= 1000; // Prevent extremely long inputs
      
      default:
        return false;
    }
  };

  // Monitor for security threats
  useEffect(() => {
    // Check for suspicious activity
    const checkSecurityThreats = () => {
      // Monitor for rapid form submissions (potential bot activity)
      let submissionCount = 0;
      const resetCount = () => { submissionCount = 0; };
      
      document.addEventListener('submit', () => {
        submissionCount++;
        if (submissionCount > 5) {
          logSecurityEvent('RAPID_SUBMISSIONS', { count: submissionCount });
        }
      });

      setInterval(resetCount, 60000); // Reset every minute
    };

    // Monitor for console access (potential script injection)
    if (isProduction) {
      const devtools = () => {
        logSecurityEvent('DEVTOOLS_OPENED');
      };

      // Simple devtools detection
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200) {
          devtools();
        }
      }, 1000);
    }

    checkSecurityThreats();
  }, [isProduction, logSecurityEvent]);

  const value: SecurityContextType = {
    encryptSensitiveData,
    decryptSensitiveData,
    logSecurityEvent,
    validateInput,
    isProduction
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};