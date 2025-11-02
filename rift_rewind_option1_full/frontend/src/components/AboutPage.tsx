import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Video, Zap, Target, Trophy, Hexagon } from "lucide-react";

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#0AC8B9]/10 to-[#C8AA6E]/10 blur-3xl rounded-full" />
        
        <div className="relative text-center">
          <div className="inline-flex w-20 h-20 rounded-md bg-gradient-to-br from-[#0AC8B9] to-[#0A8B82] items-center justify-center mb-6 border border-[#0BC6DE]/30 shadow-xl shadow-[#0AC8B9]/30">
            <Hexagon className="w-10 h-10 text-[#010A13]" fill="currentColor" />
          </div>
          
          <h1 className="mb-2 text-[#F0E6D2] tracking-wider">LoL Notify Clip</h1>
          <p className="text-[#A09B8C] mb-4">
            Your AI-powered League of Legends coaching and replay assistant
          </p>
          
          <Badge className="bg-gradient-to-r from-[#C8AA6E] to-[#785A28] border border-[#C8AA6E]/30 text-[#010A13] shadow-lg shadow-[#C8AA6E]/20 px-4 py-1 uppercase tracking-wider">
            Version 1.0.0
          </Badge>
        </div>
      </Card>

      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#0AC8B9]/5 to-transparent blur-3xl" />
        
        <div className="relative">
          <h2 className="mb-6 text-[#F0E6D2] tracking-wider">Features</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-sm bg-[#0A1428]/30 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 shrink-0 shadow-lg shadow-[#0AC8B9]/20 group-hover:shadow-[#0AC8B9]/30 transition-shadow">
                <Zap className="w-5 h-5 text-[#0AC8B9]" />
              </div>
              <div>
                <h3 className="text-[#F0E6D2] text-sm mb-1">Live Coaching Tips</h3>
                <p className="text-[#A09B8C] text-sm">
                  Get real-time suggestions on deaths, vision, macro play, and gold management
                </p>
              </div>
            </div>

            <Separator className="bg-[#1E2328]" />

            <div className="flex items-start gap-4 p-3 rounded-sm bg-[#0A1428]/30 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 shrink-0 shadow-lg shadow-[#0AC8B9]/20 group-hover:shadow-[#0AC8B9]/30 transition-shadow">
                <Video className="w-5 h-5 text-[#0AC8B9]" />
              </div>
              <div>
                <h3 className="text-[#F0E6D2] text-sm mb-1">Instant Clip Recording</h3>
                <p className="text-[#A09B8C] text-sm">
                  Press a hotkey to save your best moments with customizable clip lengths
                </p>
              </div>
            </div>

            <Separator className="bg-[#1E2328]" />

            <div className="flex items-start gap-4 p-3 rounded-sm bg-[#0A1428]/30 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#C8AA6E]/30 to-[#785A28]/30 flex items-center justify-center border border-[#C8AA6E]/50 shrink-0 shadow-lg shadow-[#C8AA6E]/20 group-hover:shadow-[#C8AA6E]/30 transition-shadow">
                <Target className="w-5 h-5 text-[#C8AA6E]" />
              </div>
              <div>
                <h3 className="text-[#F0E6D2] text-sm mb-1">Role-Specific Coaching</h3>
                <p className="text-[#A09B8C] text-sm">
                  Tailored advice for Top, Jungle, Mid, ADC, and Support roles
                </p>
              </div>
            </div>

            <Separator className="bg-[#1E2328]" />

            <div className="flex items-start gap-4 p-3 rounded-sm bg-[#0A1428]/30 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#C8AA6E]/30 to-[#785A28]/30 flex items-center justify-center border border-[#C8AA6E]/50 shrink-0 shadow-lg shadow-[#C8AA6E]/20 group-hover:shadow-[#C8AA6E]/30 transition-shadow">
                <Trophy className="w-5 h-5 text-[#C8AA6E]" />
              </div>
              <div>
                <h3 className="text-[#F0E6D2] text-sm mb-1">Highlight Management</h3>
                <p className="text-[#A09B8C] text-sm">
                  Organize and share your best plays with automatic highlight detection
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C8AA6E]/5 to-transparent blur-3xl" />
        
        <div className="relative">
          <h2 className="mb-4 text-[#F0E6D2] tracking-wider">About</h2>
          <div className="space-y-3 text-[#A09B8C]">
            <p className="leading-relaxed">
              LoL Notify Clip is designed to help League of Legends players improve their gameplay
              through intelligent coaching notifications and seamless clip recording.
            </p>
            <p className="leading-relaxed">
              Whether you're climbing ranked or just having fun in normals, our tool provides
              actionable insights to enhance your decision-making and mechanical skills.
            </p>
            <p className="leading-relaxed">
              Built with passion for the League community, featuring a sleek hextech aesthetic
              inspired by Riot Games' design language.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 metal-frame backdrop-blur-sm border-[#1E2328] relative overflow-hidden">
        <div className="absolute inset-0 hextech-pattern opacity-10" />
        <div className="relative text-center text-[#A09B8C]">
          <p className="text-sm">© 2025 LoL Notify Clip. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.
          </p>
        </div>
      </Card>
    </div>
  );
}
