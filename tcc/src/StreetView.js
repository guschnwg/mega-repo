import React, { useContext, useEffect } from "react";
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';
import { TutorialContext } from "./TutorialContext";

export function StreetView({ country }) {
  const { steps, setElement, nextStep } = useContext(TutorialContext);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    return () => {
      setElement('navigation', null);
    };
  }, [setElement]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="game-container" id="game-container">
      <GoogleMap
        ref={ref => {
          if (!steps.navigation.element && ref) {
            setElement('navigation', ref);
          }
        }}
        mapContainerStyle={{ height: '100%', width: '100%' }}
      >
        <StreetViewPanorama
          options={{
            position: country.coordinates,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            visible: true,
            enableCloseButton: false,
          }} />
      </GoogleMap>

      <div className="how-to-navigate">
        <h1>
          O que faço aqui?
        </h1>

        <p>Este jogo é como uma janela mágica que permite ver lugares de todo o mundo!</p>

        <p>É como se você estivesse na rua olhando ao redor, mas pode fazer isso pelo computador ou telefone.</p>

        <p>Seu objetivo nesse jogo é descobrir onde está.</p>

        <p>Você esta no tutorial, que nós ensinaremos você a jogar.</p>

        <p>Para olhar ao redor, você pode mover o mouse ou o dedo na tela e a imagem também se moverá.</p>

        <p>Você pode olhar para o céu, para o chão ou para todos os lados!</p>

        <p>Se quiser andar pela rua, pode clicar nas setas que aparecem na rua.</p>

        <p>Clique no botão abaixo e te mostrarei os próximos passos.</p>

        <button className="btn-show-info" onClick={nextStep}>
          Aprendi
        </button>
      </div>
    </div>
  );
}
