"use client";
import React, { use, useEffect, useState } from "react";
import "./userEditForm.css";
import { use2FAFormAuth, use2FASwitch } from "@/hooks";
import Form2fa from "../form2fa/form2fa";
import { useUserStore } from "@/store";
import { User } from "@/types";
import { updateUser } from "@/services";

const UserEditForm = () => {
  const user: User | null = useUserStore((state) => state.user);

  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { formStats, verifyTokenSubmission } = use2FAFormAuth({
    onVerifyUserSuccess: () => setIs2FAEnabled(true),
  });

  let { is2FAEnabled, setIs2FAEnabled, toggle2faSwitch } = use2FASwitch({
    onEnable: (qrcodeUrl) => {
      formStats.setShowForm(true);
      formStats.setQrcode(qrcodeUrl);
    },
  });

  const handleAvaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (user) {
      setImage(user.avatarUrl);
      setUsername(user.username);
    }
  }, [user]);

  const handleUseUpdate = async () => {
    if (username && image && (user?.username !== username || user?.avatarUrl !== image || user?.isTwofactorsEnabled !== is2FAEnabled)) {
      try {
        const updatedUser = await updateUser({ username, avatarUrl: image });
        console.log("updateUser:", updatedUser);
        if (updatedUser){
          window.location.href  = "/profile/" + updatedUser.id;
        }
      } catch (error: any) {
        console.log(error);
        setErrorMessage(error.message);
      }
    }
    // window.location.href  = "/profile/" + user?.id;
  }



  return (
    <div className="userModal pt-5 rounded-2xl bg-slate-900">
      <div className="flex flex-col gap-2 p-8">
        <img
          alt="profil"
          src={image}
          className="mx-auto mb-7 object-cover rounded-full h-20 w-20   border-2 border-white dark:border-gray-800"
        />
        <input
          className="mb-4 block w-full text-sm borderrounded-lg cursor-pointer  focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          aria-describedby="file_input_help"
          id="file_input"
          type="file"
          placeholder="upload image"
          onChange={(e) => handleAvaUpload(e)}
        />

        <input
          className="mb-4 bg-slate-900 w-full rounded-lg border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-800"
          placeholder="Username"
          onChange={(e) => {
            setErrorMessage("");
            setUsername(e.target.value);
          }}
          value={username}
        />
        <label className="flex cursor-pointer items-center justify-between p-1 text-slate-400">
          Enable 2FA
          <div className="relative inline-block">
            <input
              className="peer h-6 w-12 cursor-pointer appearance-none rounded-full border border-gray-300 bg-gary-400 checked:border-green-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              type="checkbox"
              checked={is2FAEnabled}
              onChange={toggle2faSwitch}
            />
            <span className="pointer-events-none absolute left-1 top-1 block h-4 w-4 rounded-full bg-slate-600 transition-all duration-200 peer-checked:left-7 peer-checked:bg-green-300"></span>
          </div>
        </label>

        <button
          onClick={handleUseUpdate}
          className="inline-block cursor-pointer rounded-md bg-gray-700 px-4 py-3.5 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 active:scale-95"
        >
          Save
        </button>

        {errorMessage ? <p style={{ color: "red" }}>Error: {errorMessage}</p> : null}
      </div>

      {formStats.showForm ? (
        <div className="form2fa-container ">
          <Form2fa
            qrcodeUrl={formStats.qrcode}
            submitForm={verifyTokenSubmission}
            setShowForm={formStats.setShowForm}
            isError={formStats.isFromError}
            setIsError={formStats.setIsFromError}
          />
        </div>
      ) : null}
    </div>
  );
};

export default UserEditForm;