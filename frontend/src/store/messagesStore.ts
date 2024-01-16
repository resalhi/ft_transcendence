import { create } from "zustand";


// we will create a message store to store the messages

type MessageStoreType = {
  messages: string[];
  setMessages: (messages: string[]) => void;
}

const useMessageStore = create<MessageStoreType>((set) => ({
  messages: [],
  setMessages: (messages: string[]) => set({ messages }),
}));

export default useMessageStore;