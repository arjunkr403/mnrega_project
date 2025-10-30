// simple wrapper for backend endpoints
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/mgnrega";

export async function fetchJSON(pathOrUrl) {
  // Only use BASE if not a full URL
  const url = pathOrUrl.startsWith("http") 
    ? pathOrUrl 
    : `${BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// get all districts for a given state (server already pulls from data.gov.in)
export const getDistricts = async (state = "Bihar") => {
  const states = await fetchJSON("/states?limit=10&offset=0");
  return states[state] || [];
};

// helpers to coerce and pick numeric fields reliably
const coerceNumber = (value) => {
  if (value === null || value === undefined) return undefined;
  const n = Number(String(value).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

const pickFirstNumber = (obj, keys) => {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj || {}, k)) {
      const v = coerceNumber(obj[k]);
      if (v !== undefined) return v;
    }
  }
  return undefined;
};

const pickByIncludes = (obj, substrings) => {
  const entries = Object.entries(obj || {});
  for (const [k, v] of entries) {
    const key = String(k).toLowerCase();
    const matches = substrings.every((s) => key.includes(s));
    if (!matches) continue;
    const n = coerceNumber(v);
    if (n !== undefined) return n;
  }
  return undefined;
};

// Normalize backend district doc -> { latestMonth, timeseries, timeseriesDays }
const normalizeDistrictPerformance = (doc, months = 12) => {
  const records = doc?.performance?.records || [];
  if (!Array.isArray(records) || records.length === 0) {
    return { latestMonth: {}, timeseries: [] };
  }

  // Sort by year/month string where available
  const sorted = [...records].sort((a, b) => {
    const am = `${a.month || a.month_name || ""}-${a.fin_year || a.finyear || a.year || ""}`;
    const bm = `${b.month || b.month_name || ""}-${b.fin_year || b.finyear || b.year || ""}`;
    return am.localeCompare(bm);
  });

  const last = sorted[sorted.length - 1] || {};
  const latestMonth = {
    personDays: pickFirstNumber(last, [
      "Persondays_of_Central_Liability_so_far",
      "persondays_generated",
      "person_days_generated",
      "persondays",
      "person_days",
    ]) ?? pickByIncludes(last, ["person", "day"]),
    households: pickFirstNumber(last, [
      "Total_Households_Worked",
      "households",
    ]) ?? pickByIncludes(last, ["house"]),
    expenditure: pickFirstNumber(last, [
      "Total_Exp",
    ]) ?? pickByIncludes(last, ["expend"]),
    avgDaysPerHH: pickFirstNumber(last, ["Average_days_of_employment_provided_per_Household"]),
    avgWagePerDay: pickFirstNumber(last, ["Average_Wage_rate_per_day_per_person"]),
    womenPersondays: pickFirstNumber(last, ["Women_Persondays"]),
    differentlyAbledWorked: pickFirstNumber(last, ["Differently_abled_persons_worked"]),
    paymentWithin15DaysPct: pickFirstNumber(last, ["percentage_payments_gererated_within_15_days"]),
    worksCompleted: pickFirstNumber(last, ["Number_of_Completed_Works"]),
    worksOngoing: pickFirstNumber(last, ["Number_of_Ongoing_Works"]),
    worksTotal: pickFirstNumber(last, ["Total_No_of_Works_Takenup"]),
    monthLabel: last.month || last.month_name || "",
    finYear: last.fin_year || last.finyear || last.year || "",
  };

  const timeseries = sorted.slice(-months).map((row, i) => ({
    label: row.month || row.month_name || row.fin_year || row.finyear || row.year || String(i + 1),
    value: pickFirstNumber(row, [
      "persondays_generated",
      "person_days_generated",
      "persondays",
      "person_days",
      "Persondays_of_Central_Liability_so_far",
    ]) || 0,
  }));

  const timeseriesDays = sorted.slice(-months).map((row, i) => ({
    label: row.month || row.month_name || row.fin_year || row.finyear || row.year || String(i + 1),
    value: pickFirstNumber(row, [
      "Average_days_of_employment_provided_per_Household",
    ]) || 0,
  }));

  return { latestMonth, timeseries, timeseriesDays };
};

// get data for a district (normalize and fallback to refresh if empty)
export const getDistrictPerformance = async (district, months = 12) => {
  let doc = await fetchJSON(`/${encodeURIComponent(district)}`);
  const hasRecords = Array.isArray(doc?.performance?.records) && doc.performance.records.length > 0;
  if (!hasRecords) {
    try {
      doc = await fetchJSON(`/district/refresh/${encodeURIComponent(district)}`);
    } catch (_) {
      // ignore
    }
  }
  return normalizeDistrictPerformance(doc, months);
};


// refresh data manually
export const refreshDistrict = async (district) =>
  fetchJSON(`/district/refresh/${encodeURIComponent(district)}`);

// locate user by lat/lon -> { state, district, supported }
export const locateUser = async (lat, lon) =>
  fetchJSON(`/locate?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
