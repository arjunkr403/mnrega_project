import React, { useEffect, useState } from "react";
import { getDistricts } from "../services/api";
import { useLanguage } from "../i18n/LanguageProvider";

export default function DistrictSelector({ onSelect, initial = "Patna", state = "Bihar" }) {
  const [districts, setDistricts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getDistricts(state);
        if (!mounted) return;
        setDistricts(list);
        console.log("Districts loaded:", list);
      } catch (e) {
        setDistricts([""
        ]);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [state]);

  const filtered = districts.filter(d => d.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="district-selector">
      <label className="district-label">{t("chooseDistrict")}</label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="district-input"
      />
      {loading ? (
        <div className="district-loading">{t("loading")}</div>
      ) : (
        <div className="district-list">
          {filtered.map(d => {
            const key = `districts.${d}`;
            const translated = t(key);
            const label = translated === key ? d : translated;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                className="district-btn"
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
