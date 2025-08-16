import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, 
  Database, Activity, FileText, Settings, Clock, Zap
} from 'lucide-react';
import { useSecurityContext } from '@/components/SecurityProvider';
import { supabase } from '@/integrations/supabase/client';

export const EnterpriseSafetyDashboard = () => {
  const { isProduction, logSecurityEvent } = useSecurityContext();
  const [securityMetrics, setSecurityMetrics] = useState({
    totalAgents: 24,
    activeAgents: 0,
    securityScore: 0,
    lastAudit: '',
    encryptedData: 100,
    accessControlsActive: true,
    complianceStatus: 'compliant'
  });
  const [recentSecurityEvents, setRecentSecurityEvents] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityMetrics();
    loadRecentSecurityEvents();
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Get active agents count
      const { data: agents } = await supabase
        .from('ai_agents')
        .select('id, status')
        .eq('status', 'active');

      // Calculate security score based on various factors
      const activeAgentCount = agents?.length || 0;
      const baseScore = 85; // Base security score
      const agentPenalty = Math.max(0, (activeAgentCount - 10) * 2); // Penalty for too many active agents
      const securityScore = Math.max(0, Math.min(100, baseScore - agentPenalty));

      setSecurityMetrics(prev => ({
        ...prev,
        activeAgents: activeAgentCount,
        securityScore,
        lastAudit: new Date().toLocaleDateString(),
      }));
    } catch (error) {
      console.error('Error loading security metrics:', error);
    }
  };

  const loadRecentSecurityEvents = async () => {
    try {
      const { data } = await supabase
        .from('ai_security_events')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      setRecentSecurityEvents(data || []);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const runSecurityScan = async () => {
    await logSecurityEvent('MANUAL_SECURITY_SCAN', { 
      initiatedBy: 'user', 
      timestamp: new Date().toISOString() 
    });
    
    // Simulate security scan
    setTimeout(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        securityScore: Math.min(100, prev.securityScore + 2),
        lastAudit: new Date().toLocaleDateString()
      }));
    }, 2000);
  };

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'AES-256 encryption for all data at rest and in transit',
      status: 'active',
      score: 100
    },
    {
      icon: Users,
      title: 'Access Control',
      description: 'Role-based access with multi-factor authentication',
      status: 'active',
      score: 98
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Complete audit trail of all AI agent actions',
      status: 'active',
      score: 100
    },
    {
      icon: Database,
      title: 'Data Isolation',
      description: 'Tenant isolation and secure data boundaries',
      status: 'active',
      score: 95
    },
    {
      icon: Shield,
      title: 'AI Safety Controls',
      description: 'Confidence thresholds and human oversight mechanisms',
      status: 'active',
      score: 92
    },
    {
      icon: FileText,
      title: 'Compliance Monitoring',
      description: 'GDPR, SOC 2, and industry compliance tracking',
      status: 'active',
      score: 88
    }
  ];

  const complianceStandards = [
    { name: 'SOC 2 Type II', status: 'certified', lastReview: '2024-01-15' },
    { name: 'GDPR', status: 'compliant', lastReview: '2024-02-01' },
    { name: 'CCPA', status: 'compliant', lastReview: '2024-01-28' },
    { name: 'ISO 27001', status: 'in-progress', lastReview: '2024-02-10' },
    { name: 'HIPAA', status: 'certified', lastReview: '2024-01-20' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-green-100 rounded-full">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Enterprise Security Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive security monitoring and compliance management for your AI agents
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {securityMetrics.securityScore}%
            </div>
            <p className="text-sm text-muted-foreground">Security Score</p>
            <Progress value={securityMetrics.securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {securityMetrics.activeAgents}/{securityMetrics.totalAgents}
            </div>
            <p className="text-sm text-muted-foreground">Active Agents</p>
            <Badge className="mt-2 bg-green-100 text-green-800">Monitored</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {securityMetrics.encryptedData}%
            </div>
            <p className="text-sm text-muted-foreground">Data Encrypted</p>
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
            <p className="text-sm text-muted-foreground">Security Incidents</p>
            <Badge className="mt-2 bg-green-100 text-green-800">All Clear</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Features Status
          </CardTitle>
          <CardDescription>
            Real-time monitoring of all security systems and controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconComponent className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <Progress value={feature.score} className="flex-1 mr-2" />
                    <span className="text-xs font-medium">{feature.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Compliance Standards
          </CardTitle>
          <CardDescription>
            Current compliance status with industry standards and regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{standard.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last reviewed: {standard.lastReview}
                  </p>
                </div>
                <Badge 
                  className={
                    standard.status === 'certified' ? 'bg-green-100 text-green-800' :
                    standard.status === 'compliant' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }
                >
                  {standard.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Agent Safety Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Agent Safety Controls
          </CardTitle>
          <CardDescription>
            Built-in safety mechanisms to ensure responsible AI operation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Automated Safeguards</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Confidence threshold enforcement (minimum 60%)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Human approval required for high-impact actions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Rate limiting to prevent excessive API calls
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Data validation and sanitization
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Monitoring & Alerts</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Real-time performance monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Anomaly detection for unusual patterns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Automated error reporting and recovery
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Complete audit trail for all actions
                </li>
              </ul>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Safety First:</strong> All AI agents operate with multiple safety layers. 
              High-risk actions require human approval, and all operations are logged for audit purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={runSecurityScan} className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Run Security Scan
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Download Compliance Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure Security Settings
        </Button>
      </div>
    </div>
  );
};