import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Sword, Eye, TrendingUp, DollarSign } from "lucide-react";

interface Notification {
  id: string;
  type: "deaths" | "vision" | "macro" | "gold";
  message: string;
  time: string;
}

export function NotificationsLog() {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "vision",
      message: "Ward placed near Dragon pit",
      time: "2m ago",
    },
    {
      id: "2",
      type: "deaths",
      message: "Death recorded - review positioning",
      time: "5m ago",
    },
    {
      id: "3",
      type: "macro",
      message: "Dragon objective available soon",
      time: "8m ago",
    },
    {
      id: "4",
      type: "gold",
      message: "CS milestone: 100 minions",
      time: "12m ago",
    },
    {
      id: "5",
      type: "vision",
      message: "Pink ward expired - replace soon",
      time: "15m ago",
    },
    {
      id: "6",
      type: "macro",
      message: "Baron spawning in 60 seconds",
      time: "18m ago",
    },
    {
      id: "7",
      type: "deaths",
      message: "Death #2 - enemy jungler ganked",
      time: "22m ago",
    },
    {
      id: "8",
      type: "gold",
      message: "Gold lead: +500g",
      time: "25m ago",
    },
  ];

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "deaths":
        return <Sword className="w-4 h-4 text-red-400" />;
      case "vision":
        return <Eye className="w-4 h-4 text-yellow-400" />;
      case "macro":
        return <TrendingUp className="w-4 h-4 text-[#0AC8B9]" />;
      case "gold":
        return <DollarSign className="w-4 h-4 text-[#C8AA6E]" />;
    }
  };

  const getIconBg = (type: Notification["type"]) => {
    switch (type) {
      case "deaths":
        return "bg-red-900/20 border-red-700/30";
      case "vision":
        return "bg-yellow-900/20 border-yellow-700/30";
      case "macro":
        return "bg-[#0AC8B9]/10 border-[#0AC8B9]/30";
      case "gold":
        return "bg-[#C8AA6E]/10 border-[#C8AA6E]/30";
    }
  };

  return (
    <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden h-full">
      {/* Hextech glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#0AC8B9]/5 to-transparent blur-3xl" />
      
      <div className="relative h-full flex flex-col">
        <h2 className="mb-4 text-[#F0E6D2] tracking-wider">Notifications Log</h2>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-sm hover:bg-[#1E2328]/50 transition-colors border border-transparent hover:border-[#1E2328] group relative"
              >
                {/* Hover corner accent */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#0AC8B9]/0 group-hover:border-[#0AC8B9]/30 transition-colors" />
                
                <div
                  className={`w-8 h-8 rounded-sm flex items-center justify-center border ${getIconBg(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F0E6D2]/90 text-sm">{notification.message}</p>
                  <p className="text-[#A09B8C] mt-0.5 text-xs uppercase tracking-wide">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-[#1E2328]">
          <p className="text-[#0AC8B9] text-center text-sm uppercase tracking-wide">
            {notifications.length} notifications today
          </p>
        </div>
      </div>
    </Card>
  );
}
