import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Languages, Hexagon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Language, languages, translate } from "../utils/language";

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userId: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function AppHeader({
  activeTab,
  onTabChange,
  userId,
  language,
  onLanguageChange,
}: AppHeaderProps) {
  const t = (key: string) => translate(language, key);

  const renderTab = (value: string, labelKey: string) => {
    const isActive = activeTab === value;
    return (
      <TabsTrigger
        key={value}
        value={value}
        className="relative data-[state=active]:bg-[#111827] data-[state=active]:text-[#C8AA6E] text-xs font-semibold tracking-wider px-6 py-1.5 rounded-full transition-all uppercase text-white/60"
      >
        <span className="relative z-10">
          {labelKey.startsWith("nav.") ? t(labelKey) : labelKey}
        </span>
        {isActive && (
          <div className="pointer-events-none absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent shadow-lg shadow-[#C8AA6E]/50" />
        )}
      </TabsTrigger>
    );
  };

  return (
    <header className="border-b border-[#1E2328] bg-[#0A1428]/80 backdrop-blur-xl relative">
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0AC8B9]/50 to-transparent" />

      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6 px-6 py-4">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0AC8B9] flex items-center justify-center shadow-lg shadow-[#0AC8B9]/40">
            <Hexagon className="w-5 h-5 text-[#010A13]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-white">
              {t("app.title")}
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
              Rift Rewind Coach
            </span>
          </div>
        </div>

        {/* Center tabs */}
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="bg-[#0A1428] border border-[#1E2328] rounded-full p-1 gap-1">
              {renderTab("dashboard", "nav.dashboard")}
              {renderTab("recap", "nav.recap")}
              {renderTab("settings", "nav.settings")}
              {renderTab("highlights", "nav.highlights")}
              {renderTab("about", "nav.about")}
            </TabsList>
          </Tabs>
        </div>

        {/* Language + user */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-[#1E2328] bg-[#020617] text-white hover:bg-[#020617]/80"
              >
                <Languages className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#020617] border-[#1E2328] text-white">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className={`flex items-center justify-between text-xs ${
                    language === lang.code ? "text-[#0AC8B9]" : ""
                  }`}
                  onClick={() => onLanguageChange(lang.code)}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="border-[#1E2328] bg-[#020617] text-xs text-white/80 hover:bg-[#020617]/80"
          >
            {userId || "Guest"}
          </Button>
        </div>
      </div>

      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0AC8B9]/30 to-transparent" />
    </header>
  );
}
