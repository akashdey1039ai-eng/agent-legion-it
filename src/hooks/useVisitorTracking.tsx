import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorData {
  page_url: string;
  referrer: string;
  user_agent: string;
  timestamp: string;
  session_id: string;
}

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      // Generate or get session ID
      let sessionId = sessionStorage.getItem('visitor_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('visitor_session_id', sessionId);
      }

      const visitorData: VisitorData = {
        page_url: window.location.href,
        referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        session_id: sessionId
      };

      try {
        // Store in audit_logs table for now (or create dedicated visitor table)
        await supabase
          .from('audit_logs')
          .insert({
            table_name: 'visitor_tracking',
            operation: 'PAGE_VIEW',
            new_data: visitorData as any
          });
      } catch (error) {
        console.log('Visitor tracking error:', error);
      }
    };

    trackVisitor();

    // Track page changes in SPA
    const handlePopState = () => {
      trackVisitor();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
};