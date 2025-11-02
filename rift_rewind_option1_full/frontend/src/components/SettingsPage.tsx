import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Settings, User, Bell, Video, Shield, Target, Eye, Swords } from "lucide-react";
import { useState } from "react";

interface SettingsPageProps {
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export function SettingsPage({ activeRole, onRoleChange }: SettingsPageProps) {
  const [deathsEnabled, setDeathsEnabled] = useState(true);
  const [xpEnabled, setXpEnabled] = useState(true);
  const [macroEnabled, setMacroEnabled] = useState(true);
  const [visionEnabled, setVisionEnabled] = useState(true);
  const [notificationStyle, setNotificationStyle] = useState("toast");
  const [recordHotkey, setRecordHotkey] = useState("F9");
  const [clipLength, setClipLength] = useState([30]);
  const [savePath, setSavePath] = useState("C:/Users/Games/LoL Clips");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Role Selection */}
      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#0AC8B9]/10 to-transparent blur-3xl rounded-full" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
              <User className="w-5 h-5 text-[#0AC8B9]" />
            </div>
            <h2 className="text-[#F0E6D2] tracking-wider">Role Selection</h2>
          </div>

          <div className="space-y-3">
            <Label className="text-[#C8AA6E] text-xs">Choose Your Role</Label>
            <Select value={activeRole} onValueChange={onRoleChange}>
              <SelectTrigger className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors text-[#F0E6D2] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1428] border-[#1E2328]">
                <SelectItem value="Top" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">Top</SelectItem>
                <SelectItem value="Jungle" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">Jungle</SelectItem>
                <SelectItem value="Mid" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">Mid</SelectItem>
                <SelectItem value="ADC" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">ADC</SelectItem>
                <SelectItem value="Support" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">Support</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[#A09B8C] text-sm">
              Select your primary role to receive tailored coaching tips
            </p>
          </div>
        </div>
      </Card>

      {/* Coaching Categories */}
      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#C8AA6E]/10 to-transparent blur-3xl rounded-full" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#C8AA6E]/30 to-[#785A28]/30 flex items-center justify-center border border-[#C8AA6E]/50 shadow-lg shadow-[#C8AA6E]/20">
              <Bell className="w-5 h-5 text-[#C8AA6E]" />
            </div>
            <h2 className="text-[#F0E6D2] tracking-wider">Coaching Categories</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-sm bg-[#0A1428]/50 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-red-900/20 border border-red-700/30 flex items-center justify-center group-hover:border-red-600/50 transition-colors">
                  <Swords className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <Label className="text-[#F0E6D2] text-sm">Deaths Tracking</Label>
                  <p className="text-[#A09B8C] text-xs">Monitor deaths and suggest improvements</p>
                </div>
              </div>
              <Switch
                checked={deathsEnabled}
                onCheckedChange={setDeathsEnabled}
                className="data-[state=checked]:bg-[#0AC8B9]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-sm bg-[#0A1428]/50 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-blue-900/20 border border-blue-700/30 flex items-center justify-center group-hover:border-blue-600/50 transition-colors">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <Label className="text-[#F0E6D2] text-sm">XP Tracking</Label>
                  <p className="text-[#A09B8C] text-xs">Track experience gains and lane advantages</p>
                </div>
              </div>
              <Switch 
                checked={xpEnabled} 
                onCheckedChange={setXpEnabled}
                className="data-[state=checked]:bg-[#0AC8B9]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-sm bg-[#0A1428]/50 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#0AC8B9]/10 border border-[#0AC8B9]/30 flex items-center justify-center group-hover:border-[#0AC8B9]/50 transition-colors">
                  <Shield className="w-5 h-5 text-[#0AC8B9]" />
                </div>
                <div>
                  <Label className="text-[#F0E6D2] text-sm">Macro Coaching</Label>
                  <p className="text-[#A09B8C] text-xs">Objective timers and map awareness</p>
                </div>
              </div>
              <Switch
                checked={macroEnabled}
                onCheckedChange={setMacroEnabled}
                className="data-[state=checked]:bg-[#0AC8B9]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-sm bg-[#0A1428]/50 border border-[#1E2328] hover:border-[#0AC8B9]/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-yellow-900/20 border border-yellow-700/30 flex items-center justify-center group-hover:border-yellow-600/50 transition-colors">
                  <Eye className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <Label className="text-[#F0E6D2] text-sm">Vision Control</Label>
                  <p className="text-[#A09B8C] text-xs">Ward placement and vision score</p>
                </div>
              </div>
              <Switch
                checked={visionEnabled}
                onCheckedChange={setVisionEnabled}
                className="data-[state=checked]:bg-[#0AC8B9]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-[#0AC8B9]/5 to-transparent blur-3xl rounded-full" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
              <Settings className="w-5 h-5 text-[#0AC8B9]" />
            </div>
            <h2 className="text-[#F0E6D2] tracking-wider">Notification Settings</h2>
          </div>

          <div className="space-y-3">
            <Label className="text-[#C8AA6E] text-xs">Notification Style</Label>
            <Select value={notificationStyle} onValueChange={setNotificationStyle}>
              <SelectTrigger className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors text-[#F0E6D2] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A1428] border-[#1E2328]">
                <SelectItem value="toast" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">Toast Notifications</SelectItem>
                <SelectItem value="overlay" className="text-[#F0E6D2] focus:bg-[#0AC8B9]/20 focus:text-[#0AC8B9]">In-Game Overlay</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[#A09B8C] text-sm">
              Choose how you want to receive coaching tips during gameplay
            </p>
          </div>
        </div>
      </Card>

      {/* Recording Configuration */}
      <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#C8AA6E]/10 to-transparent blur-3xl rounded-full" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#C8AA6E]/30 to-[#785A28]/30 flex items-center justify-center border border-[#C8AA6E]/50 shadow-lg shadow-[#C8AA6E]/20">
              <Video className="w-5 h-5 text-[#C8AA6E]" />
            </div>
            <h2 className="text-[#F0E6D2] tracking-wider">Recording Configuration</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#C8AA6E] text-xs">Record Hotkey</Label>
              <Input
                value={recordHotkey}
                onChange={(e) => setRecordHotkey(e.target.value)}
                className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors text-[#F0E6D2] h-10"
                placeholder="Press a key..."
              />
            </div>

            <Separator className="bg-[#1E2328]" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#C8AA6E] text-xs">Default Clip Length</Label>
                <span className="text-[#0AC8B9] uppercase tracking-wider">{clipLength[0]}s</span>
              </div>
              <Slider
                value={clipLength}
                onValueChange={setClipLength}
                min={15}
                max={90}
                step={5}
                className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#0AC8B9] [&_[role=slider]]:to-[#0A8B82] [&_[role=slider]]:border-[#0BC6DE]/30 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-[#0AC8B9]/30"
              />
              <div className="flex justify-between">
                <span className="text-[#A09B8C] text-xs">15s</span>
                <span className="text-[#A09B8C] text-xs">90s</span>
              </div>
            </div>

            <Separator className="bg-[#1E2328]" />

            <div className="space-y-2">
              <Label className="text-[#C8AA6E] text-xs">Save Folder</Label>
              <Input
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors text-[#F0E6D2] h-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="border-[#1E2328] hover:border-[#A09B8C]/50 hover:bg-[#A09B8C]/10 text-[#A09B8C] uppercase tracking-wider"
        >
          Reset to Defaults
        </Button>
        <Button className="bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] text-[#010A13] shadow-lg shadow-[#0AC8B9]/20 border-[#0BC6DE]/30 uppercase tracking-wider">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
