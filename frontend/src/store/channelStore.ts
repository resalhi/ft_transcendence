import { type } from "os";
import { create } from "zustand";

    type ChannelStoreType = {
        channel: string;
        setChannel: (channel: string) => void;
      }
    // state to store the channel name
    const useChannleTypeStore = create<ChannelStoreType>((set) => ({
        channel: "public",
        setChannel: (channel: string) => set({ channel }),
      }));

      // channel id 
      type useChannleIdStore = {
        channelId: any;
        setChannelId: (channel: any) => void;
      }

      const useChannleIdStore = create<useChannleIdStore>((set) => ({
        channelId: "",
        setChannelId: (channelId: any) => set({ channelId }),
      }));
    
export  {useChannleTypeStore};
export {useChannleIdStore};
