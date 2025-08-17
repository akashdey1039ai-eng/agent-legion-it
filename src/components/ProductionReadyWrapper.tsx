import React, { useEffect, useState } from 'react';
import { AlertCircle, Shield, Smartphone, Monitor } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecurityContext } from './SecurityProvider';

interface ProductionReadyWrapperProps {
  children: React.ReactNode;
}

export const ProductionReadyWrapper = ({ children }: ProductionReadyWrapperProps) => {
  const { isProduction, logSecurityEvent } = useSecurityContext();
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    // Detect device type for responsive UI
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Check security status
    const checkSecurity = () => {
      const isHTTPS = window.location.protocol === 'https:';
      const hasCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      setIsSecure(isHTTPS && !!hasCSP);
    };

    detectDevice();
    checkSecurity();

    window.addEventListener('resize', detectDevice);
    
    // Log production environment access
    if (isProduction) {
      logSecurityEvent('PRODUCTION_ACCESS', {
        deviceType,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }

    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, [isProduction, logSecurityEvent, deviceType]);

  // Production readiness indicators
  const ProductionHeader = () => {
    if (!isProduction) return null;

    return (
      <div className="bg-primary/10 border-b border-primary/20 p-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Production Environment</span>
            <Badge variant={isSecure ? "default" : "destructive"} className="text-xs">
              {isSecure ? "Secure" : "Security Warning"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {deviceType === 'mobile' && <Smartphone className="h-4 w-4" />}
            {deviceType === 'tablet' && <Monitor className="h-4 w-4" />}
            {deviceType === 'desktop' && <Monitor className="h-4 w-4" />}
            <span className="capitalize">{deviceType}</span>
          </div>
        </div>
      </div>
    );
  };

  // Security warnings for development - simplified and non-intrusive
  const SecurityAlerts = () => {
    if (isProduction) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert className="bg-background/95 backdrop-blur">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dev Mode</AlertTitle>
          <AlertDescription className="text-xs">
            Development environment active
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <ProductionHeader />
      
      {/* Main application content */}
      <div className={`${isProduction ? '' : 'development-mode'}`}>
        {children}
      </div>
      
      {/* Development-only security alerts - now non-intrusive */}
      <SecurityAlerts />
    </div>
  );
};