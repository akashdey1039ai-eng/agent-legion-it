import { NavLink, useLocation } from "react-router-dom";
import { 
  Bot, 
  BarChart3, 
  Users, 
  Building2, 
  Settings,
  Home,
  Zap,
  Brain,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "AI Agents", url: "/ai-agents", icon: Bot },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const agentItems = [
  { title: "Lead Intelligence", url: "/ai-agents/lead-intelligence", icon: Brain },
  { title: "Pipeline Analysis", url: "/ai-agents/pipeline-analysis", icon: TrendingUp },
  { title: "Smart Follow-up", url: "/ai-agents/follow-up", icon: Zap },
  { title: "Meeting Scheduler", url: "/ai-agents/meetings", icon: Calendar },
  { title: "Cross-Platform Sync", url: "/ai-agents/sync", icon: Target },
];

const integrationItems = [
  { title: "Salesforce", url: "/integrations/salesforce", icon: Building2 },
  { title: "HubSpot", url: "/integrations/hubspot", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  const isMainExpanded = mainItems.some((i) => isActive(i.url));
  const isAgentsExpanded = agentItems.some((i) => isActive(i.url)) || currentPath.startsWith("/ai-agents");
  const isIntegrationsExpanded = integrationItems.some((i) => isActive(i.url));

  return (
    <Sidebar
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          {state !== "collapsed" && <span className="font-semibold text-lg">CRM AI</span>}
        </div>
      </div>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Agents */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Integrations */}
        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}