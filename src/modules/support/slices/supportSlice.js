import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  modals: {
    raiseTicket: { isOpen: false, data: null },
    ticketSuccess: { isOpen: false, ticketId: null },
  },
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { modalId, data } = action.payload;
      if (state.modals[modalId]) {
        state.modals[modalId].isOpen = true;
        state.modals[modalId].data = data;
      }
    },
    closeModal: (state, action) => {
      const { modalId } = action.payload;
      if (state.modals[modalId]) {
        state.modals[modalId].isOpen = false;
        state.modals[modalId].data = null;
      }
    },
  },
});

export const { openModal, closeModal } = supportSlice.actions;
export default supportSlice.reducer;
