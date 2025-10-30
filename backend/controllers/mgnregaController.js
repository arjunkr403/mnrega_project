import axios from "axios";
import District from "../models/districtModel.js";

export const getDistrictData = async (req, res) => {
    const { district } = req.params;

    try {
        let data = await District.findOne({ district });

        if (!data) {
            //if data is not found locally, it fetches from the gov api
            const resourceId = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
            const nameMap = {
              'Purnea': 'PURNEA',
              'Purnia': 'PURNEA',
              'East Champaran': 'PURBI CHAMPARAN',
              'West Champaran': 'PASCHIM CHAMPARAN'
            };
            const districtForApi = (nameMap[district] || district).toUpperCase();
            const response = await axios.get(`https://api.data.gov.in/resource/${resourceId}`, {
                params: {
                    'api-key': process.env.DATA_GOV_API_KEY,
                    'format': 'json',
                    'filters[state_name]': 'BIHAR',
                    'filters[district_name]': districtForApi,
                    'limit': 100
                }
            });

            data = new District({ district, performance: response.data });
            await data.save();
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch data"
        });
    }
};

export const getStateAndDistricts = async (req, res) => {
    try {
        // Fetch live district list from data.gov.in and map to a clean array
        const resourceId = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
        const apiKey = process.env.DATA_GOV_API_KEY;
        const limit = Number(req.query.limit ?? 10);
        const offset = Number(req.query.offset ?? 0);
        const response = await axios.get(`https://api.data.gov.in/resource/${resourceId}`, {
            params: {
                'api-key': apiKey,
                format: 'json',
                'filters[state_name]': 'BIHAR',
                limit: Number.isFinite(limit) ? limit : 10,
                offset: Number.isFinite(offset) ? offset : 0,
            },
            headers: { Accept: 'application/json' },
            timeout: 15000,
        });

        const records = Array.isArray(response.data?.records) ? response.data.records : [];

        // Build a unique, nicely-cased district list with special-name normalization
        const specialNameMap = new Map([
            ['PURBI CHAMPARAN', 'East Champaran'],
            ['PASCHIM CHAMPARAN', 'West Champaran'],
            ['PURNEA', 'Purnea'],
        ]);

        const toTitleCase = (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

        const unique = new Set();
        for (const row of records) {
            const raw = String(row?.district_name || '').trim();
            if (!raw) continue;
            const upper = raw.toUpperCase();
            const normalized = specialNameMap.get(upper) || toTitleCase(upper);
            unique.add(normalized);
        }

        // Sort alphabetically for UI
        const districts = Array.from(unique).sort((a, b) => a.localeCompare(b));

        res.status(200).json({ Bihar: districts });
    } catch(err) {
        console.log('error details', err);
        res.status(500).json({
            message: "Failed to load states and districts"
        });
    }
}

export const refreshDistrictData = async (req, res) => {
  const { district } = req.params;

  try {
    // Use the data.gov.in API endpoint for district-wise MGNREGA data
    const resourceId = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
    const url = `https://api.data.gov.in/resource/${resourceId}`;
    const nameMap = {
      'Purnea': 'PURNEA',
      'Purnia': 'PURNEA',
      'East Champaran': 'PURBI CHAMPARAN',
      'West Champaran': 'PASCHIM CHAMPARAN'
    };
    const districtForApi = (nameMap[district] || district).toUpperCase();

    const response = await axios.get(url, {
      params: {
        'api-key': process.env.DATA_GOV_API_KEY,
        'format': 'json',
        'filters[state_name]': 'BIHAR',
        'filters[district_name]': districtForApi,
        'limit': 100
      },
      headers: {
        Accept: 'application/json'
      },
      timeout: 15000
    });

    // Update existing record or insert new one
    const updated = await District.findOneAndUpdate(
      { district },
      { performance: response.data, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    // Log full error details so we can see the API response body/status
    console.error('Error refreshing data: ', err.response?.status, err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to refresh data', details: err.response?.data || err.message });
  }
};

// Reverse geocode coordinates -> { state, district }
export const locateByCoords = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ message: "Invalid lat/lon" });
    }

    // Use OpenStreetMap Nominatim reverse geocoding (rate-limited; for demo only)
    const nominatim = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json",
        zoom: 10,
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "our-voice-our-right/1.0 (demo)"
      },
      timeout: 15000,
    });

    const addr = nominatim.data?.address || {};
    // Nominatim can put district in district/county/state_district
    const rawState = addr.state || addr.region || "";
    const rawDistrict = addr.state_district || addr.district || addr.county || "";

    const toUpper = (s) => String(s || "").trim().toUpperCase();
    const stateUpper = toUpper(rawState);
    const districtUpper = toUpper(rawDistrict);

    const specialMap = new Map([
      ["PURBI CHAMPARAN", "PURBI CHAMPARAN"],
      ["EAST CHAMPARAN", "PURBI CHAMPARAN"],
      ["WEST CHAMPARAN", "PASCHIM CHAMPARAN"],
      ["PASCHIM CHAMPARAN", "PASCHIM CHAMPARAN"],
      ["PURNIA", "PURNEA"],
      ["PURNEA", "PURNEA"],
    ]);

    const allowed = new Set([
      "PATNA","NALANDA","JEHANABAD","SAMASTIPUR","SUPAUL","ROHTAS","NAWADA","PURBI CHAMPARAN","MADHUBANI","ARARIA"
    ]);

    const normDistrict = specialMap.get(districtUpper) || districtUpper;
    const supported = stateUpper === "BIHAR" && allowed.has(normDistrict);

    // Return in display casing
    const toTitle = (s) => s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
    const displayMap = new Map([["PURBI CHAMPARAN", "Purbi Champaran"]]);
    const displayDistrict = displayMap.get(normDistrict) || toTitle(normDistrict);

    res.json({
      state: toTitle(stateUpper || rawState),
      district: displayDistrict,
      supported,
      reason: supported ? undefined : "Feature available only for Bihar (selected 10 districts)",
    });
  } catch (err) {
    console.error("locateByCoords error", err.message);
    res.status(500).json({ message: "Failed to locate district" });
  }
};
