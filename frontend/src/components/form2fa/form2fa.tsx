
"use client"

import React from "react";
import "./from2fa.css"; 

interface props {
  qrcodeUrl?: string;
  submitForm: (e: any) => void;
  setShowForm?: (showForm: boolean) => void;
  isError: boolean;
  setIsError?: (isError: boolean) => void;
}

export default function Form2fa({ qrcodeUrl, submitForm , setShowForm, isError , setIsError}: props) {
  return (
    <form className="form" onSubmit={(e) => submitForm(e)}>
      <span className="close" onClick={()=> setShowForm && setShowForm(false)}>X</span>
      <div className="info">
        <span className="title">Two-Factor Verification</span>
        <p className="description">
          Enter the two-factor authentication code provided by the authenticator
          app
        </p>
        {qrcodeUrl ? <img src={qrcodeUrl} alt="QR Code" /> : null}
      </div>
      <div className="input-fields">
        <input type="tel" placeholder="" onChange={()=>setIsError && setIsError(false)}/>
        <input type="tel" placeholder="" />
        <input type="tel" placeholder="" />
        <input type="tel" placeholder="" />
        <input type="tel" placeholder="" />
        <input type="tel" placeholder=""  onChange={()=>setIsError && setIsError(false)}/>
      </div>
      <div className="action-btns">
        <button type="submit" className="verify">
          Verify
        </button>
      </div>
     {isError ? <button className="red">Error: Invalid Token</button> : null}
    </form>
  );
}
