import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

export function AnalyticsPanel() {
  const statCards = [
    {
      icon: BarChart3,
      label: "Total Highlights",
      value: "0",
      trend: "+0%",
      color: "text-[#00d4ff]",
    },
    {
      icon: TrendingUp,
      label: "Performance Score",
      value: "0",
      trend: "+0%",
      color: "text-[#a855f7]",
    },
    {
      icon: Users,
      label: "Clips Reviewed",
      value: "0",
      trend: "+0%",
      color: "text-[#00d4ff]",
    },
    {
      icon: Target,
      label: "Accuracy Rate",
      value: "0%",
      trend: "+0%",
      color: "text-[#a855f7]",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Analytics Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-gray-400 text-sm">
          Track your performance metrics and gameplay insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.trend} from last week</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Performance Over Time Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-lg bg-black/20">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-[#00d4ff]/30 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
                <p className="text-gray-500 text-xs mt-1">
                  Start recording clips to see your progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate Analysis Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Win Rate Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-lg bg-black/20">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-[#a855f7]/30 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
                <p className="text-gray-500 text-xs mt-1">
                  Track wins and losses to analyze trends
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Champion Performance Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Champion Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-lg bg-black/20">
              <div className="text-center">
                <Target className="w-12 h-12 text-[#00d4ff]/30 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
                <p className="text-gray-500 text-xs mt-1">
                  Play games to see champion-specific stats
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Chart */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-lg bg-black/20">
              <div className="text-center">
                <Users className="w-12 h-12 text-[#a855f7]/30 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No data available</p>
                <p className="text-gray-500 text-xs mt-1">
                  Your recent gaming activity will appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
