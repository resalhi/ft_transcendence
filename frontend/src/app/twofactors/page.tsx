"use client";
import { useSearchParams } from "next/navigation"; // Import from next/navigation
import Form2fa from "../../components/form2fa/form2fa";
import { verifyFirstLogin2fa } from "@services/twofaServices";
import { use2FAFormAuth } from "@/hooks/useForm";

export default function Twofactors() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { formStats, verifyTokenSubmission } = use2FAFormAuth({
    customVerify2fa,
  });

  async function customVerify2fa(token: string) {
    const verifyuser = await verifyFirstLogin2fa(userId, token);
    if (verifyuser.isValid === true) {
      localStorage.setItem("accessToken", verifyuser.accessToken);
      window.location.href = `dashboard?&accesstoken=${verifyuser.accessToken}`;
    } else {
      formStats.setIsFromError(true);
    }
  }

  return (
      <div className="form-container">
        <Form2fa
          submitForm={verifyTokenSubmission}
          isError={formStats.isFromError}
          setIsError={formStats.setIsFromError}
        />
      </div>
  );
}
