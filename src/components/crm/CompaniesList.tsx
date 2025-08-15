import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Globe,
  Edit,
  Eye,
  MoreHorizontal,
  Users,
  DollarSign,
  MapPin
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  revenue: number | null;
  employee_count: number | null;
  company_type: string | null;
  rating: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function CompaniesList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const searchLower = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      (company.industry && company.industry.toLowerCase().includes(searchLower)) ||
      (company.city && company.city.toLowerCase().includes(searchLower)) ||
      (company.state && company.state.toLowerCase().includes(searchLower))
    );
  });

  const getCompanyTypeColor = (type: string | null) => {
    switch (type) {
      case 'customer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'prospect': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'partner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'vendor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(revenue);
  };

  const formatEmployeeCount = (count: number | null) => {
    if (!count) return null;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K employees`;
    }
    return `${count} employees`;
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
          <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Manage your business accounts and organizations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{company.name}</CardTitle>
                    {company.industry && (
                      <CardDescription className="truncate">{company.industry}</CardDescription>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.company_type && (
                <Badge className={getCompanyTypeColor(company.company_type)}>
                  {company.company_type}
                </Badge>
              )}
              
              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{company.website}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {(company.city || company.state) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">
                      {[company.city, company.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Company Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {company.employee_count && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">
                      {formatEmployeeCount(company.employee_count)}
                    </div>
                  </div>
                )}
                {company.revenue && (
                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                    <DollarSign className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                    <div className="text-xs text-muted-foreground">
                      {formatRevenue(company.revenue)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  {new Date(company.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No companies found matching your search' : 'No companies yet'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Company
          </Button>
        </div>
      )}
    </div>
  );
}