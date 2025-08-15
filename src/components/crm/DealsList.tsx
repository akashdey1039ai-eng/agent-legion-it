import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Target, 
  DollarSign, 
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Building2,
  User
} from "lucide-react";

interface Deal {
  id: string;
  name: string;
  amount: number | null;
  currency: string | null;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  lead_source: string | null;
  description: string | null;
  next_step: string | null;
  deal_type: string | null;
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
  } | null;
  contacts?: {
    first_name: string;
    last_name: string;
  } | null;
}

export function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          companies (name),
          contacts (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deal.name.toLowerCase().includes(searchLower) ||
      (deal.companies?.name && deal.companies.name.toLowerCase().includes(searchLower)) ||
      (deal.stage && deal.stage.toLowerCase().includes(searchLower))
    );
  });

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'prospecting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'qualification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'needs analysis': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'proposal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'negotiation': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'closed won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed lost': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilClose = (closeDate: string | null) => {
    if (!closeDate) return null;
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deals</h2>
          <p className="text-muted-foreground">
            Track your sales opportunities and revenue pipeline
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search deals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const daysUntilClose = getDaysUntilClose(deal.expected_close_date);
          return (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{deal.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">
                          {formatCurrency(deal.amount, deal.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStageColor(deal.stage)}>
                    {deal.stage}
                  </Badge>
                  <div className="text-sm font-medium">
                    {deal.probability}% probability
                  </div>
                </div>

                {/* Probability Progress */}
                <div className="space-y-2">
                  <Progress value={deal.probability} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {deal.companies?.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{deal.companies.name}</span>
                    </div>
                  )}
                  {deal.contacts && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">
                        {deal.contacts.first_name} {deal.contacts.last_name}
                      </span>
                    </div>
                  )}
                  {deal.expected_close_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                        {daysUntilClose !== null && (
                          <span className={`ml-2 ${
                            daysUntilClose < 0 ? 'text-red-600' : 
                            daysUntilClose <= 7 ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            ({daysUntilClose < 0 ? `${Math.abs(daysUntilClose)} days overdue` : 
                              daysUntilClose === 0 ? 'Due today' :
                              `${daysUntilClose} days left`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {deal.next_step && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Next Step</div>
                    <div className="text-sm truncate">{deal.next_step}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <TrendingUp className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDeals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No deals found matching your search' : 'No deals yet'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Deal
          </Button>
        </div>
      )}
    </div>
  );
}