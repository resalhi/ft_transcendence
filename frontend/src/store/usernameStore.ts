import { create } from "zustand";

// state to store username

type UsernameStoreType = {
  username: string;
  setUsername: (username: string) => void;
}

const useUsernameStore = create<UsernameStoreType>((set) => ({
  username: "",
  setUsername: (username: string) => set({ username }),
}));


export default useUsernameStore;