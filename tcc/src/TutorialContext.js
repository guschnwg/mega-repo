import React, { useCallback, useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Arrow } from "./Arrow";

const data = {
  timer: (
    <>
      <p>Você está jogando um jogo que tem um relógio que começa a contar do zero e vai até 60 segundos, o que é o mesmo que dizer um minuto.</p>
      <p>Durante esse tempo, você pode tentar adivinhar quantas vezes quiser.</p>
      <p>Mas, quando o tempo acabar e o relógio chegar a 60 segundos, não será mais possível fazer nenhum palpite.</p>
      <p>Nesse momento, você irá para o próximo nível do jogo.</p>
      <p>Então, é importante prestar atenção no tempo que falta para que você possa tentar adivinhar o máximo possível antes que ele acabe!</p>
    </>
  ),
  tips: (
    <>
      <p>Com esse botão especial aparecem algumas informações que podem ajudar a descobrir em qual país você está.</p>
      <p>Essas informações são chamadas de dicas, e tem um total de 10 delas. Mas, você só pode escolher 4 dessas dicas para usar e tentar adivinhar o país certo.</p>
      <p>Então, preste atenção em qual dica escolher para ter mais chances de acertar!</p>
    </>
  ),
  guess: (
    <>
      <p>Quando estiver se sentindo confiante, quando apertar esse botão um mapa aparecerá na tela.</p>
      <p>Você pode usar esse mapa para escolher em qual país você acha que está.</p>
    </>
  ),
  wrongGuess: (
    <>
      <p>Se você escolher o país errado no jogo, o país escolhido ficará marcado em vermelho no mapa.</p>
      <p>Isso significa que você precisa tentar novamente para escolher o país certo.</p>
      <p>É uma forma de te ajudar a saber que precisa continuar tentando para adivinhar o país correto.</p>
    </>
  ),
  rightGuess: (
    <>
      <p>Quando você conseguir adivinhar o país correto no jogo, uma tela especial irá aparecer na tela com uma mensagem de parabéns!</p>
      <p>Nessa tela, você irá ver as informações do país que acertou, como o nome, a bandeira e outros detalhes.</p>
      <p>Além disso, você também verá quanto tempo demorou para acertar o país, o que pode ser uma forma divertida de tentar superar todos os recordes!</p>
    </>
  ),
}

export const TutorialContext = React.createContext();
export const Tutorial = ({ active, children }) => {
  const [steps, setSteps] = useState({
    navigation: { completed: false, element: null, tooltip: false },
    timer: { completed: false, element: null, tooltip: true, canLearn: true },
    tips: { completed: false, element: null, tooltip: true, canLearn: true },
    guess: { completed: false, element: null, tooltip: true, canLearn: true },
    wrongGuess: { completed: false, element: null, tooltip: true, canLearn: false },
    rightGuess: { completed: false, element: null, tooltip: true, canLearn: false },
  });
  const [currentStep, setCurrentStep] = useState('navigation');

  const setElement = useCallback((step, element) => {
    setSteps(prev => ({ ...prev, [step]: { ...prev[step], element } }));
  }, []);

  const nextStep = () => {
    if (!active) {
      return;
    }

    const possibleSteps = Object.keys(steps);
    const nextStep = possibleSteps.findIndex(s => s === currentStep) + 1;
    setCurrentStep(possibleSteps[nextStep]);
    setSteps(prev => ({ ...prev, [currentStep]: { ...prev[currentStep], completed: true } }));
  };

  useEffect(() => {
    if (currentStep) {
      const element = steps?.[currentStep]?.element;
      if (element) {
        const theRealElement = element.mapRef?.parentElement || element;
        theRealElement.dataset.tutorial = 'active';
      }
    }

    return () => {
      if (currentStep) {
        const element = steps?.[currentStep]?.element;
        if (element) {
          const theRealElement = element.mapRef?.parentElement || element;
          theRealElement.dataset.tutorial = 'inactive';
        }
      }
    };
  }, [currentStep, steps]);

  const element = steps?.[currentStep]?.element;
  const theRealElement = element?.mapRef?.parentElement || element;

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        steps,
        setElement,
        nextStep,
        clear: () => setCurrentStep(null),
      }}
    >
      {children}

      {active && currentStep && steps[currentStep].tooltip && (
        <>
          {theRealElement && theRealElement.id && (
            <>
              <ReactTooltip key={theRealElement.id} anchorId={theRealElement.id} clickable style={{ opacity: 1 }} offset={steps[currentStep].offset || 0}>
                <div className="tooltip-container">
                  {data[currentStep]}

                  {steps[currentStep].canLearn && (
                    <button className="btn-show-info" onClick={nextStep}>
                      Aprendi
                    </button>
                  )}
                </div>
              </ReactTooltip>
              <Arrow to={theRealElement} />
            </>
          )}
        </>
      )}
    </TutorialContext.Provider>
  );
};
