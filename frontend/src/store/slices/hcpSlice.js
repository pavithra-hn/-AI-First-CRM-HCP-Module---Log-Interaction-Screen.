import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hcpApi } from '../../api/interactionApi';

export const fetchHCPs = createAsyncThunk(
  'hcps/fetchAll',
  async (search = '', { rejectWithValue }) => {
    try {
      const response = await hcpApi.getAll(search);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch HCPs');
    }
  }
);

const hcpSlice = createSlice({
  name: 'hcps',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedHCP: null,
  },
  reducers: {
    setSelectedHCP: (state, action) => {
      state.selectedHCP = action.payload;
    },
    clearSelectedHCP: (state) => {
      state.selectedHCP = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedHCP, clearSelectedHCP } = hcpSlice.actions;
export default hcpSlice.reducer;
