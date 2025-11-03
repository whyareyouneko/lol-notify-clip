import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { Auth } from "./components/Auth";
import { LiveCoachingPanel } from "./components/LiveCoachingPanel";
import { ClipRecorderPanel } from "./components/ClipRecorderPanel";
import { NotificationsLog } from "./components/NotificationsLog";
import { SettingsPage } from "./components/SettingsPage";
import { HighlightsPage } from "./components/HighlightsPage";
import { AboutPage } from "./components/AboutPage";
import { RecapPage } from "./components/RecapPage"; // <-- NEW
import { Toaster } from "./components/ui/sonner";
import { Language } from "./utils/language";

export default function App() {
  // which tab/page is active in the main area
  const [activeTab, setActiveTab] = useState("dashboard");

  // user settings
  const [activeRole, setActiveRole] = useState("Mid");

  // TEMP: force logged-in so you can see the app without auth blocking you
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // track some user id if/when you sign in for real
  const [userId, setUserId] = useState("");

  // language / i18n stuff
  const [language, setLanguage] = useState<Language>("en");

  // if you DO want the login gate back later, set isAuthenticated=false by default
  // and keep this block. for dev right now isAuthenticated=true so this won't run.
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
    <div className="min-h-screen bg-[#010A13] dark relative">
      {/* Top nav / tabs / language switcher */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userId={userId}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main page body swaps based on activeTab */}
      <main className="mx-auto px-6 py-6 max-w-[1400px] relative z-10 space-y-6">
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

        {activeTab === "recap" && (
          <RecapPage />
        )}

        {activeTab === "settings" && (
          <SettingsPage
            activeRole={activeRole}
            onRoleChange={setActiveRole}
          />
        )}

        {activeTab === "highlights" && (
          <HighlightsPage />
        )}

        {activeTab === "about" && (
          <AboutPage />
        )}
      </main>

      {/* Hextech glowing background / ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0AC8B9]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#C8AA6E]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full hextech-pattern opacity-50" />
      </div>

      {/* toast notifications etc */}
      <Toaster />
    </div>
  );
}
