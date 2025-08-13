import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Zap, Shield } from "lucide-react";

const stats = [
  {
    label: "Active Agents",
    value: "12",
    icon: Users,
    color: "text-primary"
  },
  {
    label: "Operations",
    value: "847",
    icon: Activity,
    color: "text-accent"
  },
  {
    label: "Success Rate",
    value: "98.2%",
    icon: Zap,
    color: "text-primary"
  },
  {
    label: "Security Level",
    value: "Maximum",
    icon: Shield,
    color: "text-accent"
  }
];

export function CommandCenter() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="bg-card/50 border-primary/20 hover:shadow-command transition-cyber">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}