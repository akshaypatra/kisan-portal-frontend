// src/features/mandi/mandiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Build query string with the API params described:
 * - api-key (required)
 * - format (json/csv/xml) - we'll use json
 * - offset, limit
 * - filters[...] (e.g. filters[market], filters[commodity], etc)
 *
 * NOTE: Replace RESOURCE_ID with the actual resource id from the data.gov.in resource page.
 */
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070'; // <- replace this
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// default sample test key (you provided it)
const DEFAULT_API_KEY = '579b464db66ec23bdd0000016b29150f2bac4f8057aa9349a264fa7d';

/** Build the final API URL with all query params */
function buildUrl({
  apiKey = DEFAULT_API_KEY,
  format = "json",
  offset = 0,
  limit = 10,
  filters = {},
}) {
  const params = new URLSearchParams();

  params.set("api-key", apiKey);
  params.set("format", format);
  params.set("offset", offset);
  params.set("limit", limit);

  // Add filters with structure: filters[state], filters[commodity], etc.
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      params.set(`filters[${key}]`, value);
    }
  });

  return `${BASE_URL}?${params.toString()}`;
}

/** Async thunk fetcher */
export const fetchMandiRecords = createAsyncThunk(
  "mandi/fetchMandiRecords",
  async (options, { rejectWithValue }) => {
    try {
      const url = buildUrl(options);
      const res = await fetch(url);

      if (!res.ok) {
        return rejectWithValue(`HTTP ${res.status}`);
      }

      const json = await res.json();

      /**
       * data.gov.in response formats:
       * {
       *   "records": [...],
       *   "count": 10,
       *   "total": 1234
       * }
       */
      const records = json.records || [];
      const total = json.total || json.count || records.length;

      return { records, total };
    } catch (err) {
      return rejectWithValue(err.message || "Fetch failed");
    }
  }
);

const mandiSlice = createSlice({
  name: "mandi",
  initialState: {
    records: [],
    total: 0,
    loading: false,
    error: null,
  },

  reducers: {
    clearMandiData(state) {
      state.records = [];
      state.total = 0;
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMandiRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMandiRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.total = action.payload.total;
      })

      .addCase(fetchMandiRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch data";
      });
  },
});

export const { clearMandiData } = mandiSlice.actions;
export default mandiSlice.reducer;