import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sword, Eye, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface CoachingTip {
  id: string;
  type: "deaths" | "vision" | "macro" | "gold";
  message: string;
  timestamp: string;
}

interface LiveCoachingPanelProps {
  activeRole: string;
}

export function LiveCoachingPanel({ activeRole }: LiveCoachingPanelProps) {
  const tips: CoachingTip[] = [
    {
      id: "1",
      type: "vision",
      message: "Ward placed! Vision coverage increased to 45%",
      timestamp: "2m ago",
    },
    {
      id: "2",
      type: "deaths",
      message: "Avoid overextending without vision",
      timestamp: "5m ago",
    },
    {
      id: "3",
      type: "macro",
      message: "Dragon spawning in 30s - prepare objective control",
      timestamp: "8m ago",
    },
  ];

  const getIcon = (type: CoachingTip["type"]) => {
    switch (type) {
      case "deaths":
        return <Sword className="w-4 h-4" />;
      case "vision":
        return <Eye className="w-4 h-4" />;
      case "macro":
        return <TrendingUp className="w-4 h-4" />;
      case "gold":
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getColor = (type: CoachingTip["type"]) => {
    switch (type) {
      case "deaths":
        return "from-red-900/30 to-red-800/30 border-red-700/50 text-red-400";
      case "vision":
        return "from-yellow-900/30 to-yellow-800/30 border-yellow-700/50 text-yellow-400";
      case "macro":
        return "from-[#0AC8B9]/20 to-[#0A8B82]/20 border-[#0AC8B9]/50 text-[#0AC8B9]";
      case "gold":
        return "from-[#C8AA6E]/20 to-[#785A28]/20 border-[#C8AA6E]/50 text-[#C8AA6E]";
    }
  };

  return (
    <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
      {/* Hextech glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0AC8B9]/10 to-transparent blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#F0E6D2] tracking-wider">Live Coaching</h2>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(10, 200, 185, 0.3)",
                "0 0 30px rgba(200, 170, 110, 0.5)",
                "0 0 20px rgba(10, 200, 185, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <Badge className="bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] border-[#0BC6DE]/30 text-[#010A13] px-4 py-1 uppercase tracking-wider">
              {activeRole}
            </Badge>
          </motion.div>
        </div>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`p-4 rounded-md bg-gradient-to-r ${getColor(
                  tip.type
                )} border backdrop-blur-sm relative`}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-black/20 flex items-center justify-center border border-current/30 mt-0.5">
                    {getIcon(tip.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#F0E6D2]/90 text-sm">{tip.message}</p>
                    <p className="text-[#A09B8C] mt-1 text-xs uppercase tracking-wide">{tip.timestamp}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#1E2328]/50 rounded-md border border-[#1E2328]">
          <p className="text-[#0AC8B9] text-center text-sm uppercase tracking-wide">
            Monitoring your gameplay...
          </p>
        </div>
      </div>
    </Card>
  );
}
