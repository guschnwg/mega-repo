import React from "react";
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';

export function StreetView({ country }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="game-container" id="game-container">
      <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }}>
        <StreetViewPanorama
          options={{
            position: country.coordinates,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            visible: true,
            enableCloseButton: false,
          }} />
      </GoogleMap>
    </div>
  );
}
