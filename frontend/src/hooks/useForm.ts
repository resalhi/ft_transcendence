import { verifyEnabled2fa } from "@/services/twofaServices";
import React, {useState } from "react";

interface Use2FAFormAuthProps {
  onVerifyUserSuccess?: () => void;
  customVerify2fa?: (token: string) => void;
}

export function use2FAFormAuth({
  customVerify2fa,
  onVerifyUserSuccess,
}: Use2FAFormAuthProps) {
  const [showForm, setShowForm] = useState(false);
  const [qrcode, setQrcode] = useState("");
  const [isFromError, setIsFromError] = useState(false);

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputFields = document.querySelectorAll(".input-fields input");
    let token = "";
    inputFields.forEach((input: Element) => {
      token += (input as HTMLInputElement).value;
    });
    try {
      if (customVerify2fa) {
        customVerify2fa(token);
        return;
      }
      const verifyUser = await verifyEnabled2fa(token);
      if (verifyUser.isValid === true) {
        setShowForm(false);
        onVerifyUserSuccess && onVerifyUserSuccess();
      } else {
        setIsFromError(true);
      }
    } catch (error) {
      console.error("Error in verify 2fa token", error);
      throw new Error("Error in verify 2fa token");
    }
  };
  return {
    formStats: {
      showForm,
      setShowForm,
      qrcode,
      setQrcode,
      isFromError,
      setIsFromError,
    },
    verifyTokenSubmission: handle2FASubmit,
  };
}
