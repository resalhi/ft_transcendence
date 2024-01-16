'use client'
import { disable2fa, generateQrcodeUrl } from "@/services/twofaServices";
import { useUserStore } from "@/store";
import { User } from "@/types";
import { useEffect, useState } from "react";

interface Use2faSwitchProps {
  onEnable: (qrcodeUrl: string) => void;
}

export const use2FASwitch = ({ onEnable }: Use2faSwitchProps) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const user:User | null= useUserStore((state) => state.user);
  const getUser= useUserStore((state) => state.getUser);

  useEffect(() => {
    getUser();
  },[]);

  useEffect(() => {
    user && setIs2FAEnabled(user.isTwofactorsEnabled);
  }, [user]);

  const handle2FAToggle = async () => {
    try {
      if (is2FAEnabled === false) {
        console.log("enable 2fa");
        const qrcodeUrl = await generateQrcodeUrl();
        onEnable && onEnable(qrcodeUrl);
      } else if (is2FAEnabled === true) {
        console.log("disable 2fa");
        const disbaleData = await disable2fa();
        console.log(disbaleData);
        setIs2FAEnabled(disbaleData.isDisable == true ? false : true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    is2FAEnabled,
    setIs2FAEnabled,
    toggle2faSwitch: handle2FAToggle,
  };
};