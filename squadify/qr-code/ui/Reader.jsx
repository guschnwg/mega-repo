import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const Reader = () => {
  const ref = useRef();

  const [ready, setReady] = useState(null);
  const [error, setError] = useState(null);
  const [decodedText, setDecodedText] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (ready && ref && ref.current && !scanner) {
      let html5QrcodeScanner = new Html5Qrcode(ref.current.id);
      html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10 },
        (decodedText, decodedResult) => {
          setDecodedText(decodedText);
        },
        (error) => { },
      );
      setScanner(html5QrcodeScanner);
    }
  }, [ref, scanner, ready]);

  const start = async () => {
    let devices = null;
    try {
      devices = await Html5Qrcode.getCameras()
    } catch {
      setError("Not accepted!");
      setReady(false);
      return;
    }

    if (!devices) {
      setError("No cameras!");
      setReady(false);
      return;
    }

    setReady(true);
    setError(null);
  }

  if (error !== null) {
    return <pre>{JSON.stringify(error)}</pre>;
  }

  if (!ready) {
    return (
      <button
        className="request-permission-button"
        onClick={start}
      >
        START
      </button>
    );
  }

  return (
    <>
      <div id="reader" ref={ref} />

      {decodedText}
    </>
  );
};

export { Reader };
