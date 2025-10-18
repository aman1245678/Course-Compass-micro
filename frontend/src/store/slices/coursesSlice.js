import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE =
  process.env.REACT_APP_COURSE_SERVICE_URL || "http://localhost:3002";

export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/api/courses`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch courses");
    }
  }
);

export const searchCourses = createAsyncThunk(
  "courses/searchCourses",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/api/courses/search`, {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Search failed");
    }
  }
);

export const uploadCourses = createAsyncThunk(
  "courses/uploadCourses",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/api/courses/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Upload failed");
    }
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    searchResults: [],
    loading: false,
    error: null,
    uploadStatus: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUploadStatus: (state) => {
      state.uploadStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results;
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadCourses.pending, (state) => {
        state.uploadStatus = "uploading";
      })
      .addCase(uploadCourses.fulfilled, (state, action) => {
        state.uploadStatus = "success";
        state.courses = [...state.courses];
      })
      .addCase(uploadCourses.rejected, (state, action) => {
        state.uploadStatus = "error";
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearError, clearUploadStatus } =
  coursesSlice.actions;
export default coursesSlice.reducer;
