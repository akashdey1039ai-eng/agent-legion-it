import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { 
  Users, 
  Building2, 
  Target, 
  User, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Archive
} from "lucide-react";

// Import CRM components that we'll create
import { LeadsList } from "@/components/crm/LeadsList";
import { ContactsList } from "@/components/crm/ContactsList";
import { CompaniesList } from "@/components/crm/CompaniesList";
import { DealsList } from "@/components/crm/DealsList";
import { TasksList } from "@/components/crm/TasksList";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { CRMReports } from "@/components/crm/CRMReports";
import { CRMSettings } from "@/components/crm/CRMSettings";

export default function CRM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    { name: "Active Leads", value: "124", change: "+12%", icon: Users, color: "text-blue-600" },
    { name: "Open Deals", value: "43", change: "+8%", icon: Target, color: "text-green-600" },
    { name: "Pipeline Value", value: "$2.4M", change: "+23%", icon: DollarSign, color: "text-purple-600" },
    { name: "This Month Revenue", value: "$340K", change: "+15%", icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Native CRM</h1>
            <p className="text-muted-foreground">
              AI-powered customer relationship management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-green-600">{stat.change}</span> from last month
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main CRM Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <CRMDashboard />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsList />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <ContactsList />
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <CompaniesList />
          </TabsContent>

          <TabsContent value="deals" className="mt-6">
            <DealsList />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TasksList />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <CRMReports />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <CRMSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}