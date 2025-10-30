import React from "react";
import { useLanguage } from "../i18n/LanguageProvider";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
        className={`lang-btn ${lang === "en" ? "lang-btn-active" : "lang-btn-inactive"}`}
      >
        {t("languageEnglish")}
      </button>
      <button
        aria-pressed={lang === "hi"}
        onClick={() => setLang("hi")}
        className={`lang-btn ${lang === "hi" ? "lang-btn-active" : "lang-btn-inactive"}`}
      >
        {t("languageHindi")}
      </button>
    </div>
  );
}
