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

export function AppHeader({ activeTab, onTabChange, userId, language, onLanguageChange }: AppHeaderProps) {
  const t = (key: string) => translate(language, key);

  return (
    <header className="border-b border-[#1E2328] bg-[#0A1428]/80 backdrop-blur-xl relative">
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0AC8B9]/50 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0AC8B9] to-[#C8AA6E] opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#0AC8B9] to-[#0A8B82] flex items-center justify-center border border-[#0BC6DE]/30 shadow-lg shadow-[#0AC8B9]/20">
                <Hexagon className="w-7 h-7 text-[#010A13]" fill="currentColor" />
              </div>
              <div>
                <h1 className="tracking-wide bg-gradient-to-r from-[#0AC8B9] to-[#C8AA6E] bg-clip-text text-transparent uppercase">
                  {t('app.title')}
                </h1>
                {userId && (
                  <p className="text-[#C8AA6E] text-sm uppercase tracking-wider">@{userId}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
            <TabsList className="bg-[#0A1428] border border-[#1E2328] p-1 gap-1">
              <TabsTrigger
                value="dashboard"
                className="relative data-[state=active]:bg-transparent data-[state=active]:text-[#C8AA6E] transition-all uppercase tracking-wider px-6"
              >
                <span className="relative z-10">{t('nav.dashboard')}</span>
                {activeTab === 'dashboard' && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent shadow-lg shadow-[#C8AA6E]/50" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="relative data-[state=active]:bg-transparent data-[state=active]:text-[#C8AA6E] transition-all uppercase tracking-wider px-6"
              >
                <span className="relative z-10">{t('nav.settings')}</span>
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent shadow-lg shadow-[#C8AA6E]/50" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="highlights"
                className="relative data-[state=active]:bg-transparent data-[state=active]:text-[#C8AA6E] transition-all uppercase tracking-wider px-6"
              >
                <span className="relative z-10">{t('nav.highlights')}</span>
                {activeTab === 'highlights' && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent shadow-lg shadow-[#C8AA6E]/50" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="relative data-[state=active]:bg-transparent data-[state=active]:text-[#C8AA6E] transition-all uppercase tracking-wider px-6"
              >
                <span className="relative z-10">{t('nav.about')}</span>
                {activeTab === 'about' && (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#C8AA6E] to-transparent shadow-lg shadow-[#C8AA6E]/50" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="border border-[#1E2328] hover:border-[#0AC8B9]/50 hover:bg-[#0AC8B9]/10 transition-all"
              >
                <Languages className="h-5 w-5 text-[#0AC8B9]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0A1428] border-[#1E2328] backdrop-blur-xl">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`cursor-pointer transition-colors ${
                    language === lang.code 
                      ? 'bg-[#0AC8B9]/20 text-[#0AC8B9]' 
                      : 'hover:bg-[#1E2328] text-[#A09B8C]'
                  }`}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0AC8B9]/30 to-transparent" />
    </header>
  );
}
