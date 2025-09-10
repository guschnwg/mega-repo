import React, { useEffect, useRef, useState } from "react";

import { Html5QrcodeScanner } from "html5-qrcode";

const Reader = () => {
  const ref = useRef();
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (ref && ref.current && !scanner) {
      function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code matched = ${decodedText}`, decodedResult);
      }

      function onScanFailure(error) { }

      let html5QrcodeScanner = new Html5QrcodeScanner(
        ref.current.id,
        { fps: 10 },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      setScanner(html5QrcodeScanner);
    }
  }, [ref, scanner]);

  return <div id="reader" ref={ref} />;
};

export { Reader };
