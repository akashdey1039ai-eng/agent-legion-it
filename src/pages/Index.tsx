import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { CommandCenter } from "@/components/CommandCenter";
import heroCommand from "@/assets/hero-command.jpg";
import { Terminal, Code, Database, Shield, Bot, Zap, Target, Brain } from "lucide-react";

const aiAgents = [
  {
    id: "neural-001",
    name: "Neural Analyst",
    description: "Advanced pattern recognition and data analysis specialist. Processes complex datasets to extract actionable insights and predict trends.",
    capabilities: ["Pattern Recognition", "Predictive Analytics", "Data Mining", "Statistical Modeling"],
    status: "active" as const,
    specialization: "Data Intelligence",
    icon: "bot" as const
  },
  {
    id: "cyber-002", 
    name: "Cyber Guardian",
    description: "Elite cybersecurity agent designed to detect, prevent, and neutralize digital threats across all network infrastructures.",
    capabilities: ["Threat Detection", "Vulnerability Scanning", "Incident Response", "Security Monitoring"],
    status: "deployed" as const,
    specialization: "Security Operations",
    icon: "shield" as const
  },
  {
    id: "quantum-003",
    name: "Quantum Optimizer",
    description: "High-performance optimization agent that leverages quantum algorithms to solve complex computational problems.",
    capabilities: ["Algorithm Optimization", "Resource Management", "Performance Tuning", "System Analysis"],
    status: "active" as const,
    specialization: "Performance Engineering",
    icon: "zap" as const
  },
  {
    id: "tactical-004",
    name: "Tactical Coordinator",
    description: "Strategic planning and execution specialist that coordinates multi-agent operations and resource allocation.",
    capabilities: ["Strategic Planning", "Resource Allocation", "Mission Coordination", "Risk Assessment"],
    status: "standby" as const,
    specialization: "Operations Management",
    icon: "target" as const
  },
  {
    id: "dev-005",
    name: "Code Architect",
    description: "Autonomous development agent capable of writing, testing, and optimizing code across multiple programming languages.",
    capabilities: ["Code Generation", "Testing Automation", "Code Review", "Documentation"],
    status: "active" as const,
    specialization: "Software Development",
    icon: "bot" as const
  },
  {
    id: "intel-006",
    name: "Intelligence Processor",
    description: "Advanced NLP and machine learning agent specialized in processing and understanding unstructured data.",
    capabilities: ["Natural Language Processing", "Sentiment Analysis", "Content Generation", "Language Translation"],
    status: "active" as const,
    specialization: "AI/ML Operations",
    icon: "bot" as const
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCommand})` }}
        >
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Command Center</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-command bg-clip-text text-transparent">
              Deploy Your Army of
              <br />
              <span className="text-foreground">AI Agents</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Welcome to the command center where intelligent agents work tirelessly to optimize, secure, and enhance your IT infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="command" size="lg" className="min-w-48">
                <Bot className="h-5 w-5" />
                Deploy All Agents
              </Button>
              <Button variant="neural" size="lg" className="min-w-48">
                <Code className="h-5 w-5" />
                View Operations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Command Center Stats */}
      <section className="py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Command Center Status</h2>
            <p className="text-muted-foreground">Real-time monitoring of AI agent operations</p>
          </div>
          <CommandCenter />
        </div>
      </section>

      {/* AI Agents Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Active AI Agents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each agent is specialized for specific tasks and operates autonomously to maintain optimal system performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            AI Army Command Center - Powered by Advanced Intelligence Systems
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
