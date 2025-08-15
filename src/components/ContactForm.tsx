import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X, Save, User, Building, Mail, Phone } from 'lucide-react';

interface ContactFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface ContactData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  title: string;
  department: string;
  status: string;
  lead_source: string;
  preferred_contact_method: string;
}

const ContactForm = ({ onClose, onSave }: ContactFormProps) => {
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile_phone: '',
    title: '',
    department: '',
    status: 'new',
    lead_source: '',
    preferred_contact_method: 'email'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.first_name || !contactData.last_name || !contactData.email) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and email are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: "Failed to create contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Contact
            </CardTitle>
            <CardDescription>Create a new contact record</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={contactData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={contactData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contactData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile_phone">Mobile Phone</Label>
                  <Input
                    id="mobile_phone"
                    value={contactData.mobile_phone}
                    onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={contactData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={contactData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department"
                  />
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={contactData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select value={contactData.lead_source} onValueChange={(value) => handleInputChange('lead_source', value)}>
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferred_contact_method">Preferred Contact</Label>
                  <Select value={contactData.preferred_contact_method} onValueChange={(value) => handleInputChange('preferred_contact_method', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              Save Contact
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ContactForm;