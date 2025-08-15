import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X, Save, HandCoins, Calendar, DollarSign } from 'lucide-react';

interface DealFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface DealData {
  name: string;
  amount: number | '';
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
  description: string;
  next_step: string;
  deal_type: string;
  lead_source: string;
}

interface SalesStage {
  id: string;
  name: string;
  probability: number;
  stage_order: number;
}

const DealForm = ({ onClose, onSave }: DealFormProps) => {
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [dealData, setDealData] = useState<DealData>({
    name: '',
    amount: '',
    currency: 'USD',
    stage: 'prospecting',
    probability: 10,
    expected_close_date: '',
    description: '',
    next_step: '',
    deal_type: '',
    lead_source: ''
  });

  useEffect(() => {
    fetchSalesStages();
  }, []);

  const fetchSalesStages = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching sales stages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dealData.name || !dealData.amount) {
      toast({
        title: "Validation Error",
        description: "Deal name and amount are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('deals')
        .insert([{
          ...dealData,
          amount: Number(dealData.amount)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DealData, value: string | number) => {
    setDealData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update probability when stage changes
    if (field === 'stage' && typeof value === 'string') {
      const selectedStage = stages.find(stage => stage.name.toLowerCase() === value.toLowerCase());
      if (selectedStage) {
        setDealData(prev => ({ ...prev, probability: selectedStage.probability }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Create New Deal
            </CardTitle>
            <CardDescription>Add a new sales opportunity</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HandCoins className="h-4 w-4" />
                Deal Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Deal Name *</Label>
                <Input
                  id="name"
                  value={dealData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter deal name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={dealData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={dealData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    value={dealData.probability}
                    onChange={(e) => handleInputChange('probability', Number(e.target.value))}
                    min="0"
                    max="100"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Sales Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sales Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Sales Stage</Label>
                  <Select value={dealData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.name.toLowerCase()}>
                          {stage.name} ({stage.probability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_close_date">Expected Close Date</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={dealData.expected_close_date}
                    onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal_type">Deal Type</Label>
                  <Select value={dealData.deal_type} onValueChange={(value) => handleInputChange('deal_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_business">New Business</SelectItem>
                      <SelectItem value="existing_customer">Existing Customer</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="cross_sell">Cross-sell</SelectItem>
                      <SelectItem value="upsell">Upsell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select value={dealData.lead_source} onValueChange={(value) => handleInputChange('lead_source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="email_campaign">Email Campaign</SelectItem>
                      <SelectItem value="trade_show">Trade Show</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={dealData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter deal description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_step">Next Step</Label>
                <Input
                  id="next_step"
                  value={dealData.next_step}
                  onChange={(e) => handleInputChange('next_step', e.target.value)}
                  placeholder="Enter next action or follow-up"
                />
              </div>
            </div>
          </CardContent>

          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Deal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DealForm;