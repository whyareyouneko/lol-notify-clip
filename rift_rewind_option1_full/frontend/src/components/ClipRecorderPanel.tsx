import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Video, Folder, Check, Play } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function ClipRecorderPanel() {
  const [clipLength, setClipLength] = useState([30]);
  const [recordHotkey, setRecordHotkey] = useState("F9");
  const [savePath, setSavePath] = useState("C:/Users/Games/LoL Clips");
  const [clipSaved, setClipSaved] = useState(false);

  const handleSaveClip = () => {
    setClipSaved(true);
    setTimeout(() => setClipSaved(false), 2000);
  };

  return (
    <Card className="p-6 metal-frame hextech-corner backdrop-blur-sm relative overflow-hidden">
      {/* Hextech glow effect */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#C8AA6E]/10 to-transparent blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#0AC8B9]/30 to-[#0A8B82]/30 flex items-center justify-center border border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
            <Video className="w-5 h-5 text-[#0AC8B9]" />
          </div>
          <h2 className="text-[#F0E6D2] tracking-wider">Clip Recorder</h2>
        </div>

        <div className="space-y-6">
          {/* Record Hotkey */}
          <div className="space-y-2">
            <Label className="text-[#C8AA6E] text-xs">Record Hotkey</Label>
            <Input
              value={recordHotkey}
              onChange={(e) => setRecordHotkey(e.target.value)}
              className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors text-[#F0E6D2] h-10"
              placeholder="Press a key..."
            />
          </div>

          {/* Clip Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#C8AA6E] text-xs">Clip Length</Label>
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

          {/* Save Location */}
          <div className="space-y-2">
            <Label className="text-[#C8AA6E] text-xs">Save Location</Label>
            <div className="flex gap-2">
              <Input
                value={savePath}
                onChange={(e) => setSavePath(e.target.value)}
                className="bg-[#0A1428] border-[#1E2328] focus:border-[#0AC8B9]/50 transition-colors flex-1 text-[#F0E6D2] h-10"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-[#1E2328] hover:border-[#0AC8B9]/50 hover:bg-[#0AC8B9]/10 bg-[#0A1428] h-10 w-10"
              >
                <Folder className="w-4 h-4 text-[#0AC8B9]" />
              </Button>
            </div>
          </div>

          {/* Last Clip Saved */}
          <div className="space-y-2">
            <Label className="text-[#C8AA6E] text-xs">Last Clip Saved</Label>
            <div className="relative aspect-video rounded-md bg-[#0A1428] border border-[#1E2328] overflow-hidden group hover:border-[#0AC8B9]/30 transition-all">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#1E2328] flex items-center justify-center border border-[#0AC8B9]/30 group-hover:border-[#0AC8B9]/50 transition-all">
                    <Play className="w-8 h-8 text-[#0AC8B9] ml-1" fill="currentColor" />
                  </div>
                  <p className="text-[#A09B8C] text-sm">No recent clip</p>
                  <p className="text-[#0AC8B9] text-xs uppercase tracking-wider">Press {recordHotkey} to record</p>
                </div>
              </div>
              
              {/* Hover overlay with hextech effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0AC8B9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Corner accents */}
              <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#0AC8B9]/20 group-hover:border-[#0AC8B9]/50 transition-colors" />
              <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#0AC8B9]/20 group-hover:border-[#0AC8B9]/50 transition-colors" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A09B8C] text-xs uppercase tracking-wider">--:--:--</span>
              <Button
                onClick={handleSaveClip}
                className="bg-gradient-to-r from-[#0AC8B9] to-[#0A8B82] hover:from-[#0BC6DE] hover:to-[#0AC8B9] border-[#0BC6DE]/30 text-[#010A13] relative shadow-lg shadow-[#0AC8B9]/20 h-9"
              >
                <AnimatePresence mode="wait">
                  {clipSaved ? (
                    <motion.div
                      key="saved"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Saved!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manual"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      Manual Record
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
