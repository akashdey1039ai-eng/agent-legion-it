import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  encryptSensitiveData: (data: any) => string;
  decryptSensitiveData: (encryptedData: string) => any;
  logSecurityEvent: (event: string, details?: any) => void;
  validateInput: (input: string, type: 'email' | 'phone' | 'text' | 'name' | 'url') => boolean;
  sanitizeInput: (input: string) => string;
  checkRateLimit: (action: string) => boolean;
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

  // Enhanced input validation with comprehensive XSS protection
  const validateInput = (input: string, type: 'email' | 'phone' | 'text' | 'name' | 'url'): boolean => {
    // Comprehensive XSS prevention
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[\s\S]*?src[\s]*=[\s]*['"]*javascript:/gi,
      /<object[\s\S]*?>/gi,
      /<embed[\s\S]*?>/gi,
      /<link[\s\S]*?>/gi,
      /<meta[\s\S]*?>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /livescript:/gi,
      /mocha:/gi,
      /eval\s*\(/gi,
      /document\.(cookie|write|writeln)/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        logSecurityEvent('XSS_ATTEMPT', { 
          input: input.substring(0, 100),
          pattern: pattern.toString(),
          type 
        });
        return false;
      }
    }

    // SQL injection prevention
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--|#|\/\*|\*\/)/gi,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
      /('|(\\x27)|(\\x2D\\x2D))/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        logSecurityEvent('SQL_INJECTION_ATTEMPT', { 
          input: input.substring(0, 100),
          pattern: pattern.toString(),
          type 
        });
        return false;
      }
    }

    // Type-specific validation with enhanced security
    switch (type) {
      case 'email':
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(input) || input.length > 254) {
          logSecurityEvent('INVALID_EMAIL_FORMAT', { input: input.substring(0, 50) });
          return false;
        }
        break;
      
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{7,20}$/;
        if (!phoneRegex.test(input)) {
          logSecurityEvent('INVALID_PHONE_FORMAT', { input: input.substring(0, 20) });
          return false;
        }
        break;
      
      case 'name':
        // Names should only contain letters, spaces, apostrophes, hyphens
        const nameRegex = /^[a-zA-Z\s'\-\.]{1,100}$/;
        if (!nameRegex.test(input)) {
          logSecurityEvent('INVALID_NAME_FORMAT', { input: input.substring(0, 50) });
          return false;
        }
        break;
      
      case 'url':
        try {
          const url = new URL(input);
          if (!['http:', 'https:'].includes(url.protocol)) {
            logSecurityEvent('INVALID_URL_PROTOCOL', { input: input.substring(0, 100) });
            return false;
          }
        } catch {
          logSecurityEvent('INVALID_URL_FORMAT', { input: input.substring(0, 100) });
          return false;
        }
        break;
      
      case 'text':
        if (input.length > 5000) { // Increased but still reasonable limit
          logSecurityEvent('TEXT_TOO_LONG', { length: input.length });
          return false;
        }
        break;
      
      default:
        logSecurityEvent('UNKNOWN_VALIDATION_TYPE', { type });
        return false;
    }

    return true;
  };

  // Sanitize input data
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  };

  // Rate limiting for form submissions
  const checkRateLimit = (action: string): boolean => {
    const now = Date.now();
    const key = `rate_limit_${action}`;
    const lastAction = localStorage.getItem(key);
    
    if (lastAction && now - parseInt(lastAction) < 1000) { // 1 second rate limit
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { action, lastAction });
      return false;
    }
    
    localStorage.setItem(key, now.toString());
    return true;
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
    sanitizeInput,
    checkRateLimit,
    isProduction
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};