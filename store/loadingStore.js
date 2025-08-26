import { create } from "zustand";

export const useLoadingStore = create((set) => ({
    backgroundColor: "transparent",
    hideLoader: () => set({ isLoading: false }),
    isLoading: false,
    loaderColor: "#0082F2",
    showLoader: (options = {}) =>
      set({
        backgroundColor: options.backgroundColor || "transparent",
        isLoading: true,
        loaderColor: options.loaderColor || "#0082F2",
        text: options.text || "Loading...",
        textColor: options.textColor || "white",
      }),
    text: "Loading...",
    textColor: "white",
  }));