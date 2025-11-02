import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Video, Play, Download, Share2, BarChart3, TrendingUp, Users, Target } from "lucide-react";

export function HighlightsPage() {
  const highlights = [
    {
      id: "1",
      title: "Pentakill - Bot Lane",
      duration: "45s",
      date: "Today, 3:24 PM",
    },
    {
      id: "2",
      title: "Baron Steal",
      duration: "30s",
      date: "Yesterday, 8:15 PM",
    },
    {
      id: "3",
      title: "1v3 Outplay",
      duration: "60s",
      date: "2 days ago",
    },
  ];

  const statCards = [
    {
      icon: BarChart3,
      label: "Total Highlights",
      value: "24",
      trend: "+12%",
      color: "text-[#0AC8B9]",
    },
    {
      icon: TrendingUp,
      label: "Performance Score",
      value: "87",
      trend: "+5%",
      color: "text-[#C8AA6E]",
    },
    {
      icon: Users,
      label: "Clips Reviewed",
      value: "156",
      trend: "+23%",
      color: "text-[#0AC8B9]",
    },
    {
      icon: Target,
      label: "Accuracy Rate",
      value: "91%",
      trend: "+8%",
      color: "text-[#C8AA6E]",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Existing Highlights Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#F0E6D2] tracking-wider">Your Highlights</h2>
          <p className="text-[#A09B8C] mt-1 text-sm">
            Best moments from your recent games
          </p>
        </div>
        <Button className="bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] border-[#0BC6DE]/30 text-[#010A13] shadow-lg shadow-[#0AC8B9]/20 uppercase tracking-wider">
          <Video className="w-4 h-4 mr-2" />
          View All Clips
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((highlight) => (
          <Card
            key={highlight.id}
            className="p-4 metal-frame hextech-corner backdrop-blur-sm hover:border-[#0AC8B9]/50 transition-all group relative overflow-hidden"
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0AC8B9]/0 to-[#0AC8B9]/0 group-hover:from-[#0AC8B9]/5 group-hover:to-transparent transition-all pointer-events-none" />
            
            <div className="relative aspect-video rounded-sm bg-[#0A1428] mb-4 overflow-hidden border border-[#1E2328]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 group-hover:scale-110 transition-transform shadow-lg shadow-[#0AC8B9]/20">
                  <Play className="w-8 h-8 text-[#0AC8B9] ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-[#010A13]/90 backdrop-blur-sm border border-[#1E2328]">
                <span className="text-[#0AC8B9] text-xs uppercase tracking-wider">{highlight.duration}</span>
              </div>
              {/* Corner accents */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#0AC8B9]/20 group-hover:border-[#0AC8B9]/50 transition-colors" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#0AC8B9]/20 group-hover:border-[#0AC8B9]/50 transition-colors" />
            </div>

            <div className="space-y-3 relative">
              <div>
                <h3 className="text-[#F0E6D2] text-sm">{highlight.title}</h3>
                <p className="text-[#A09B8C] text-xs uppercase tracking-wide">{highlight.date}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#1E2328] hover:border-[#C8AA6E]/50 hover:bg-[#C8AA6E]/10 bg-[#0A1428] text-[#C8AA6E] text-xs uppercase tracking-wider"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-[#1E2328] hover:border-[#0AC8B9]/50 hover:bg-[#0AC8B9]/10 bg-[#0A1428] text-[#0AC8B9] text-xs uppercase tracking-wider"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 metal-frame hextech-corner backdrop-blur-sm text-center relative overflow-hidden">
        <div className="absolute inset-0 hextech-pattern opacity-20" />
        <div className="relative">
          <Video className="w-16 h-16 text-[#0AC8B9]/50 mx-auto mb-4" />
          <h3 className="mb-2 text-[#F0E6D2] tracking-wider">No more highlights</h3>
          <p className="text-[#A09B8C] mb-4">
            Keep playing and recording to build your highlight reel!
          </p>
          <Button
            variant="outline"
            className="border-[#1E2328] hover:border-[#0AC8B9]/50 hover:bg-[#0AC8B9]/10 text-[#0AC8B9] uppercase tracking-wider"
          >
            View Recording Settings
          </Button>
        </div>
      </Card>

      {/* Analytics Dashboard Section - Scrollable at Bottom */}
      <div className="space-y-6 pt-8 pb-12">
        {/* Analytics Header */}
        <div className="border-t border-[#1E2328] pt-8 pb-4">
          <h2 className="text-[#F0E6D2] mb-2 tracking-wider">Analytics Dashboard</h2>
          <p className="text-[#A09B8C] text-sm">
            Track your performance metrics and gameplay insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="metal-frame backdrop-blur-sm border-[#1E2328] hover:border-[#0AC8B9]/30 transition-all relative overflow-hidden group"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0AC8B9]/20 group-hover:border-[#0AC8B9]/50 transition-colors" />
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[#C8AA6E] text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-3xl text-[#F0E6D2]">{stat.value}</p>
                    <p className="text-xs text-[#0AC8B9] mt-1 uppercase tracking-wide">
                      {stat.trend} from last week
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/20 to-[#0A8B82]/20 flex items-center justify-center border border-[#0AC8B9]/30">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty Chart Placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Performance Over Time Chart */}
          <Card className="metal-frame backdrop-blur-sm border-[#1E2328]">
            <CardHeader>
              <CardTitle className="text-lg text-[#F0E6D2] tracking-wider">
                Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#1E2328] rounded-sm bg-[#0A1428]/50">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[#0AC8B9]/30 mx-auto mb-3" />
                  <p className="text-[#A09B8C] text-sm">No data available</p>
                  <p className="text-[#A09B8C]/60 text-xs mt-1 uppercase tracking-wide">
                    Start recording clips to see your progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate Analysis Chart */}
          <Card className="metal-frame backdrop-blur-sm border-[#1E2328]">
            <CardHeader>
              <CardTitle className="text-lg text-[#F0E6D2] tracking-wider">
                Win Rate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#1E2328] rounded-sm bg-[#0A1428]/50">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-[#C8AA6E]/30 mx-auto mb-3" />
                  <p className="text-[#A09B8C] text-sm">No data available</p>
                  <p className="text-[#A09B8C]/60 text-xs mt-1 uppercase tracking-wide">
                    Track wins and losses to analyze trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Champion Performance Chart */}
          <Card className="metal-frame backdrop-blur-sm border-[#1E2328]">
            <CardHeader>
              <CardTitle className="text-lg text-[#F0E6D2] tracking-wider">
                Champion Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#1E2328] rounded-sm bg-[#0A1428]/50">
                <div className="text-center">
                  <Target className="w-12 h-12 text-[#0AC8B9]/30 mx-auto mb-3" />
                  <p className="text-[#A09B8C] text-sm">No data available</p>
                  <p className="text-[#A09B8C]/60 text-xs mt-1 uppercase tracking-wide">
                    Play games to see champion-specific stats
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Chart */}
          <Card className="metal-frame backdrop-blur-sm border-[#1E2328]">
            <CardHeader>
              <CardTitle className="text-lg text-[#F0E6D2] tracking-wider">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#1E2328] rounded-sm bg-[#0A1428]/50">
                <div className="text-center">
                  <Users className="w-12 h-12 text-[#C8AA6E]/30 mx-auto mb-3" />
                  <p className="text-[#A09B8C] text-sm">No data available</p>
                  <p className="text-[#A09B8C]/60 text-xs mt-1 uppercase tracking-wide">
                    Your recent gaming activity will appear here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
