export const verifyFirstLogin2fa = async (userId: string | null, token: string): Promise<{ isValid: boolean, accessToken: string }> => {
  try {
    if (!userId) throw new Error("User id not found");
    const response = await fetch("http://localhost:3001/user/verify2f-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, id: userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify 2FA for the fisrt Login: ${response.statusText}`);
    }
    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to verify 2FA in the first login");
  }
};

export const generateQrcodeUrl = async (): Promise<string> => {
  try {
    const response = await fetch("http://localhost:3001/user/enable2fa", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error(`Failed to enable 2FA: ${response.statusText}`);

    const data = await response.json();

    if (data.qrcodeUrl === "") throw new Error("Failed to enable 2FA becuase qrcode is empty");

    return data.qrcodeUrl;
  } catch (error) {
    throw new Error("Failed to enable 2FA");
  }
};

interface Verify2faResponse {
  isDisable: boolean;
}
export const disable2fa = async (): Promise<Verify2faResponse> => {
  try {
    const response = await fetch("http://localhost:3001/user/disable2fa", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error(`Failed to disable 2FA: ${response.statusText}`);
    const disbaleData: Verify2faResponse = await response.json();
    return disbaleData;
  } catch (error) {
    throw new Error("Failed to disable 2FA");
  }
};

export const verifyEnabled2fa = async (token: string): Promise<{ isValid: boolean}> => {
  try {
    const response = await fetch("http://localhost:3001/user/verify2fa", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error(`Failed to verify 2FA for enabled user's 2fa: ${response.statusText}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to verify 2FA for enabled user's 2fa ");
  }
};
