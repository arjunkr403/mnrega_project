import React, { useEffect, useState } from "react";
import { getDistrictPerformance } from "../services/api";
import BarChart from "../components/BarChart";
import PieChart, { PieLegend } from "../components/PieChart";
import { useLanguage } from "../i18n/LanguageProvider";

export default function Dashboard({ state, district }) {
  const [loading, setLoading] = useState(true);
  const [perf, setPerf] = useState(null);
  const [error, setError] = useState("");
  const { t, tryT } = useLanguage();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const data = await getDistrictPerformance(district, 12);
        if (!mounted) return;
        setPerf(data);
      } catch {
        setError("Unable to fetch performance data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [state, district]);

  if (loading) return <div className="bg-white p-6 rounded-lg shadow">{t("loading")}</div>;
  if (error) return <div className="bg-white p-6 rounded-lg shadow text-red-600">{error}</div>;
  if (!perf) return null;

  const { latestMonth = {}, timeseriesDays = [] } = perf;
  const fmt = (n) => (n == null ? "—" : new Intl.NumberFormat("en-IN").format(n));
  const fmtMoney = (n) => (n == null ? "—" : `₹${new Intl.NumberFormat("en-IN").format(n)}`);
  const fmtPct = (n) => (n == null ? "—" : `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n)}%`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <span className="font-medium">{t("stateLabel")}</span> <span>{tryT(`states.${state}`, state)}</span>
        <span className="opacity-40">|</span>
        <span className="font-medium">{t("districtLabel")}</span> <span>{tryT(`districts.${district}`, district)}</span>
        <span className="opacity-40">|</span>
        <span className="font-medium">{t("monthLabel")}</span>{" "}
        <span>{latestMonth.monthLabel ? tryT(`months.${latestMonth.monthLabel}`, latestMonth.monthLabel) : "—"} {latestMonth.finYear}</span>
      </div>

      {/* Employment Summary */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm text-blue-800">
        <h3 className="font-semibold mb-3 text-lg">{t("employmentSummary")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.households)}</div>
            <div className="text-xs opacity-75">{t("households")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.avgDaysPerHH)}</div>
            <div className="text-xs opacity-75">{t("avgDays")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.womenPersondays)}</div>
            <div className="text-xs opacity-75">{t("womenPersondays")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.differentlyAbledWorked)}</div>
            <div className="text-xs opacity-75">{t("differentlyAbled")}</div>
          </div>
        </div>
      </div>

      {/* Wages & Payments */}
      <div className="bg-green-50 p-4 rounded-lg shadow-sm text-green-800">
        <h3 className="font-semibold mb-3 text-lg">{t("wagesPayments")}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-center">
          <div>
            <div className="text-3xl font-extrabold">{fmtMoney(latestMonth.avgWagePerDay)}</div>
            <div className="text-xs opacity-75">{t("avgWage")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmtMoney(latestMonth.expenditure)}</div>
            <div className="text-xs opacity-75">{t("totalExpenditure")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmtPct(latestMonth.paymentWithin15DaysPct)}</div>
            <div className="text-xs opacity-75">{t("paymentsWithin")}</div>
          </div>
        </div>
      </div>

      {/* Works & Projects */}
      <div className="bg-orange-50 p-4 rounded-lg shadow-sm text-orange-800">
        <h3 className="font-semibold mb-3 text-lg">{t("worksProjects")}</h3>
        <div className="grid grid-cols-2 gap-4  sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.worksCompleted)}</div>
            <div className="text-xs opacity-75">{t("completed")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.worksOngoing)}</div>
            <div className="text-xs opacity-75">{t("ongoing")}</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{fmt(latestMonth.worksTotal)}</div>
            <div className="text-xs opacity-75">{t("total")}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg shadow-sm text-indigo-800">
          <h3 className="font-semibold mb-3 text-lg">{t("employmentTrend")}</h3>
          <BarChart data={timeseriesDays} xLabel={t("monthLabel")} yLabel={t("avgDays")} />
        </div>
        <div className="bg-pink-50 p-4 rounded-lg shadow-sm text-pink-800">
          <h3 className="font-semibold mb-3 text-lg">{t("worksCompletion")}</h3>
          <PieChart completed={latestMonth.worksCompleted || 0} ongoing={latestMonth.worksOngoing || 0} />
          <PieLegend completed={latestMonth.worksCompleted || 0} ongoing={latestMonth.worksOngoing || 0} />
        </div>
      </div>
    </div>
  );
}
