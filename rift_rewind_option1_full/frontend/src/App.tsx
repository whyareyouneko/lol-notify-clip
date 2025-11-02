import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Auth } from "./components/Auth";
import { LiveCoachingPanel } from "./components/LiveCoachingPanel";
import { ClipRecorderPanel } from "./components/ClipRecorderPanel";
import { NotificationsLog } from "./components/NotificationsLog";
import { SettingsPage } from "./components/SettingsPage";
import { HighlightsPage } from "./components/HighlightsPage";
import { AboutPage } from "./components/AboutPage";
import { Toaster } from "./components/ui/sonner";
import { Language } from "./utils/language";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeRole, setActiveRole] = useState("Mid");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [language, setLanguage] = useState<Language>('en');

  if (!isAuthenticated) {
    return (
      <>
        <Auth
          onSignIn={(id) => {
            setUserId(id);
            setIsAuthenticated(true);
          }}
          language={language}
          onLanguageChange={setLanguage}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#010A13] dark">
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userId={userId}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="mx-auto px-6 py-6 max-w-[1400px]">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LiveCoachingPanel activeRole={activeRole} />
            </div>
            <div className="lg:col-span-1">
              <ClipRecorderPanel />
            </div>
            <div className="lg:col-span-1">
              <NotificationsLog />
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsPage activeRole={activeRole} onRoleChange={setActiveRole} />
        )}

        {activeTab === "highlights" && <HighlightsPage />}

        {activeTab === "about" && <AboutPage />}
      </main>

      {/* Hextech Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0AC8B9]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#C8AA6E]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full hextech-pattern opacity-50" />
      </div>

      <Toaster />
    </div>
  );
}
