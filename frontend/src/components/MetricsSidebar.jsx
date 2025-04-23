import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Contrast, 
  ImageIcon, 
  LinkIcon, 
  Maximize, 
  Users, 
  Table2, 
  BarChart2
} from "lucide-react";

export default function MetricsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Define all metrics navigation items
  const metrics = [
    {
      name: "Color Contrast",
      path: "/analysis/contrast",
      icon: Contrast,
    },
    {
      name: "Logo Analysis",
      path: "/analysis/logo",
      icon: ImageIcon,
    },
    {
      name: "Hyperlinks",
      path: "/analysis/hyperlinks",
      icon: LinkIcon,
    },
    {
      name: "Resolution",
      path: "/analysis/resolution",
      icon: Maximize,
    },
    {
      name: "Authors",
      path: "/analysis/authors",
      icon: Users,
    },
    {
      name: "Font Analysis",
      path: "/analysis/fonts",
      icon: Type,
    },
    {
      name: "Tables",
      path: "/analysis/tables",
      icon: Table2,
    },
    {
      name: "Diagrams",
      path: "/analysis/diagram",
      icon: BarChart2,
    },
  ];

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-10">
      <div className="flex flex-col bg-card shadow-lg rounded-r-md border border-l-0 border-border overflow-hidden">
        {metrics.map((metric) => {
          const isActive = currentPath === metric.path;
          return (
            <Tooltip key={metric.path} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(metric.path)}
                  className={cn(
                    "p-3 transition-colors relative",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10 text-foreground"
                  )}
                  aria-label={metric.name}
                  aria-current={isActive ? "page" : undefined}
                >
                  <metric.icon className="h-5 w-5" />
                  {isActive && (
                    <div className="absolute right-0 top-0 h-full w-1 bg-secondary"></div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {metric.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}