import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const Reader = () => {
  const ref = useRef();

  const [ready, setReady] = useState(null);
  const [error, setError] = useState(null);
  const [decodedText, setDecodedText] = useState(null);
  const [scanner, setScanner] = useState(null);

  const startScan = async () => {
    let html5QrcodeScanner = new Html5Qrcode(ref.current.id);

    await html5QrcodeScanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      (decodedText, decodedResult) => {
        setDecodedText(decodedText);
        html5QrcodeScanner.pause(true);
      },
      (error) => { },
    );
    setScanner(html5QrcodeScanner);
  }

  const resumeScan = () => {
    setDecodedText(null);
    scanner.resume();
  }

  useEffect(() => {
    if (ready && ref && ref.current && !scanner) {
      startScan();
    }
    return () => {
      if (scanner) {
        scanner.stop();
      }
    }
  }, [ref, scanner, ready]);

  const requestPermission = async () => {
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
        onClick={requestPermission}
      >
        START
      </button>
    );
  }

  return (
    <div className="reader">
      <div id="reader" ref={ref} />

      {decodedText && (
        <div className="decoded-text">
          <div className="backdrop" />
          <div className="content" onClick={resumeScan}>
            <span>{decodedText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { Reader };
