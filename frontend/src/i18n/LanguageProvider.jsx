import React, { createContext, useContext, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  const t = (key, vars = {}) => {
    // support dot-notation keys (e.g. 'districts.Patna' or 'months.Nov')
    const parts = key.split(".");
    let node = translations[lang];
    // try primary namespace first
    for (let i = 0; i < parts.length; i++) {
      if (!node) break;
      node = node[parts[i]];
    }

    // fallback to extra namespace (hi_extra / en_extra) if not found
    if (node === undefined || node === null) {
      const extraNode = translations[`${lang}_extra`];
      node = extraNode;
      for (let i = 0; i < parts.length; i++) {
        if (!node) break;
        node = node[parts[i]];
      }
    }

    const str = node === undefined || node === null ? key : node;
    return Object.keys(vars).reduce((s, k) => s.replace(new RegExp(`{${k}}`, "g"), vars[k] ?? ""), str);
  };

  // helper to attempt translation and return fallback when key not found
  const tryT = (key, fallback) => {
    const res = t(key);
    return res === key ? fallback : res;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tryT }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
