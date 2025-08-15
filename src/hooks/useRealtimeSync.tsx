import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeSyncOptions {
  enabled: boolean;
  tables: string[];
}

export function useRealtimeSync({ enabled, tables }: RealtimeSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || tables.length === 0) {
      setIsConnected(false);
      return;
    }

    console.log('Setting up real-time sync for tables:', tables);
    
    // Create channels for each table
    const channels = tables.map(table => {
      const channel = supabase
        .channel(`realtime-${table}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: table
          },
          (payload) => {
            console.log(`Real-time update received for ${table}:`, payload);
            setLastSyncTime(new Date().toISOString());
            
            // Show toast notification for updates
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Data Synced",
                description: `New ${table.slice(0, -1)} added from CRM`,
              });
            } else if (payload.eventType === 'UPDATE') {
              toast({
                title: "Data Updated",
                description: `${table.slice(0, -1)} updated from CRM`,
              });
            }
          }
        )
        .subscribe((status) => {
          console.log(`Real-time subscription status for ${table}:`, status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CLOSED') {
            setIsConnected(false);
          }
        });

      return { table, channel };
    });

    // Show initial connection toast only once
    const toastTimeout = setTimeout(() => {
      toast({
        title: "Real-time Sync Enabled",
        description: `Monitoring ${tables.join(', ')} for live updates`,
      });
    }, 1000);

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions');
      clearTimeout(toastTimeout);
      channels.forEach(({ channel }) => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [enabled, tables.join(',')]); // Use tables.join(',') to prevent array reference issues

  return {
    isConnected,
    lastSyncTime,
  };
}