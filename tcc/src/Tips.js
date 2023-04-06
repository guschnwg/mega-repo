import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from 'react-modal';
import { TutorialContext } from "./TutorialContext";

export function Tips({ tips, viewed, canViewTip, onView }) {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const { steps, setElement, nextStep, currentStep } = useContext(TutorialContext);

  useEffect(() => {
    if (ref.current) {
      setElement('tips', ref.current);
    }
    return () => {
      setElement('tips', null);
    };
  }, [ref, setElement]);

  return (
    <>
      <button data-disabled={!steps.timer.completed} onClick={() => {
        if (steps.timer.completed) {
          setShow(true);
          if (currentStep === 'tips') {
            nextStep();
          }
        }
      }} id="tips-button" ref={ref}>TIPS</button>

      <Modal isOpen={show} onRequestClose={() => setShow(false)}>
        <div className="right-attempt tips-modal">
          {tips.map(tip => {
            if (viewed.includes(tip)) {
              return (
                <div className="tip" key={tip}>
                  <button disabled>Dica vista</button>
                  <p>{tip}</p>
                </div>
              );
            }

            return (
              <div className="tip" key={tip}>
                <button disabled={!canViewTip} onClick={() => onView(tip)}>{canViewTip ? 'Ver dica' : 'Já viu 4'}</button>
                <p>{tip.replace(/[^ ]/g, "*")}</p>
              </div>
            );
          })}
        </div>

        <button className="close-modal-button" onClick={() => setShow(false)}>Sair</button>
      </Modal>
    </>
  );
}
