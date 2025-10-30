import React, { useState } from "react";
import DistrictSelector from "../components/DistrictSelector";
import Dashboard from "./Dashboard";
import { locateUser } from "../services/api";
import { useLanguage } from "../i18n/LanguageProvider";

export default function Home() {
  const [district, setDistrict] = useState(null);
  const [autoDetectMsg, setAutoDetectMsg] = useState("");
  const [autoDetected, setAutoDetected] = useState({ state: null, district: null, supported: false });
  const { t } = useLanguage();

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setAutoDetectMsg("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAutoDetectMsg(t("locating"));
        locateUser(pos.coords.latitude, pos.coords.longitude)
          .then((json) => {
            setAutoDetected(json);
            if (json?.supported) {
              setDistrict(json.district);
              setAutoDetectMsg(
                t("detectedLocation", {
                  state: json.state,
                  district: json.district ? `, ${json.district}` : "",
                })
              );
            } else {
              setAutoDetectMsg(t("unsupportedLocation"));
              setDistrict(null);
            }
          })
          .catch(() => setAutoDetectMsg(t("detectingError")));
      },
      () => setAutoDetectMsg(t("permissionDenied"))
    );
  };

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <DistrictSelector onSelect={setDistrict} />
        <div className="card">
          <h2 className="font-semibold mb-3 text-slate-800">{t("quickActions")}</h2>
          <button
            onClick={handleAutoDetect}
            className="btn-primary"
          >
            {t("autoDetect")}
          </button>
          {autoDetectMsg && (
            <p className="mt-2 text-sm text-slate-600">{autoDetectMsg}</p>
          )}
          {autoDetected?.state && (
            <p className="mt-1 text-xs text-slate-500">
              {t("detectedLabel")} {autoDetected.state}
              {autoDetected.district ? `, ${autoDetected.district}` : ""}
            </p>
          )}
          <p className="mt-4 text-sm text-slate-500">{t("tipLocation")}</p>
        </div>
      </section>

      <section>
        {district ? (
          <Dashboard state="Bihar" district={district} />
        ) : (
          <div className="card text-slate-600 text-center">
            {t("selectDistrictPrompt")}
          </div>
        )}
      </section>
    </div>
  );
}
