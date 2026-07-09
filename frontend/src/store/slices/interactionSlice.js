import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interactionApi } from '../../api/interactionApi';

// Async thunks
export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await interactionApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch interactions');
    }
  }
);

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (interactionData, { rejectWithValue }) => {
    try {
      const response = await interactionApi.create(interactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create interaction');
    }
  }
);

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await interactionApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update interaction');
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await interactionApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete interaction');
    }
  }
);

const interactionSlice = createSlice({
  name: 'interactions',
  initialState: {
    items: [],
    currentInteraction: null,
    loading: false,
    error: null,
    editModalOpen: false,
    editingInteraction: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    openEditModal: (state, action) => {
      state.editModalOpen = true;
      state.editingInteraction = action.payload;
    },
    closeEditModal: (state) => {
      state.editModalOpen = false;
      state.editingInteraction = null;
    },
    setCurrentInteraction: (state, action) => {
      state.currentInteraction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchInteractions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createInteraction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateInteraction.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.editModalOpen = false;
        state.editingInteraction = null;
      })
      // Delete
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearError, openEditModal, closeEditModal, setCurrentInteraction } = interactionSlice.actions;
export default interactionSlice.reducer;
