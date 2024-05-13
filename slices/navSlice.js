import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  origi: null,
  destination: null,
  traverTimeInformation: null,
};

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducer: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setTraverTimeInformation: (state, action) => {
      state.traverTimeInformation = action.payload;
    },
  },
});

export const { setOrigin, setDestination, setTraverTimeInformation } =
  navSlice.actions;

export const selectOrigin = (state) => state.nav.origin;
export const selectDestination = (state) => state.nav.destination;
export const selectTravelTimeInformation = (state) =>
  state.nav.traverTimeInformation;

export default navSlice.reducer;
