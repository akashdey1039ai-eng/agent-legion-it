import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Zap, Target, Shield } from "lucide-react";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    status: "active" | "standby" | "deployed";
    specialization: string;
    icon: "bot" | "zap" | "target" | "shield";
  };
}

const iconMap = {
  bot: Bot,
  zap: Zap,
  target: Target,
  shield: Shield,
};

const statusColors = {
  active: "bg-primary",
  standby: "bg-accent",
  deployed: "bg-destructive",
};

export function AgentCard({ agent }: AgentCardProps) {
  const IconComponent = iconMap[agent.icon];
  
  return (
    <Card className="group hover:shadow-glow transition-neural hover:scale-105 bg-gradient-neural border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {agent.specialization}
              </CardDescription>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]} shadow-glow`} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {agent.description}
        </p>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Capabilities</h4>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((capability, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-secondary/50 border border-primary/20 hover:bg-primary/10"
              >
                {capability}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            variant="neural" 
            size="sm" 
            className="w-full"
          >
            Deploy Agent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}