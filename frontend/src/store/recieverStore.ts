import { create } from "zustand";

// we will create a store to store the reciever name

type RecieverStoreType = {
  reciever: string;
  setReciever: (reciever: string) => void;
}

const useRecieverStore = create<RecieverStoreType>((set) => ({
  reciever: "",
  setReciever: (reciever: string) => set({ reciever }),
}));

export default useRecieverStore;