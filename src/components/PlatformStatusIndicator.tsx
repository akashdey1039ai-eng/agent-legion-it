import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Database, Zap } from 'lucide-react';

interface PlatformStatusIndicatorProps {
  platforms: {
    native: boolean;
    salesforce: boolean;
    hubspot: boolean;
  };
  className?: string;
}

export function PlatformStatusIndicator({ platforms, className = "" }: PlatformStatusIndicatorProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Active Data Sources</span>
          <Database className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Native CRM</span>
            {platforms.native ? (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Salesforce</span>
            {platforms.salesforce ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">Disconnected</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs">HubSpot</span>
            {platforms.hubspot ? (
              <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                <Zap className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">Disconnected</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}