import React from "react";
import Home from "./pages/Home";
import LanguageToggle from "./components/LanguageToggle";
import { useLanguage } from "./i18n/LanguageProvider";

export default function App() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-indigo-600 to-sky-500 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-white">
          <h1 className="text-2xl font-bold tracking-tight">{t("appTitle")}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm opacity-90">{t("headerHint")}</div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Home />
      </main>
    </div>
  );
}
