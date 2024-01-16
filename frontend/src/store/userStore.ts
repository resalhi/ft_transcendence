import { fetchLoggedUser } from "@/services";
import { create, StateCreator } from "zustand";
import {
  persist,
  devtools,
  PersistOptions,
  DevtoolsOptions,
  createJSONStorage 
} from "zustand/middleware";
import { User } from "@/types";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  getUser: () => Promise<void>;
}

type MyPersist = (
  config: StateCreator<UserStore>,
  options: PersistOptions<UserStore>
) => StateCreator<UserStore>;

type MyDevTools = (
  config: StateCreator<UserStore>,
  options: DevtoolsOptions
) => StateCreator<UserStore>;

const useUserStore = create<UserStore>(
  (persist as MyPersist)(
    (devtools as MyDevTools)(
      (set:any) => ({
        user: null,
        setUser: (user:any) => set({ user }),
        getUser: async () => {
          try {
            const newUser = await fetchLoggedUser();
            set({ user: newUser });
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        },
      }),
      { name: "user-store-devtools" } // Name for devtools
    ),
    {
      name: "user-store",
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Custom hook to check if the user click on a direct message or channel
// userStore.ts

type IsDirectMessageType = {
  isDirectMessage: boolean;
  setIsDirectMessage: (isDirectMessage: boolean) => void;
}

const useIsDirectMessage = create<IsDirectMessageType>((set) => ({
  isDirectMessage: false,
  setIsDirectMessage: (isDirectMessage: boolean) => set({ isDirectMessage }),
}));


export default useUserStore;
export { useIsDirectMessage };

