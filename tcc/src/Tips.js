import React, { useState } from "react";
import Modal from 'react-modal';

export function Tips({ tips, viewed, tipsLimit, onView }) {
  const [show, setShow] = useState(false);

  const canViewTip = tipsLimit > viewed.length;

  return (
    <>
      <button onClick={() => setShow(true)} id="tips-button">Dicas</button>

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
                <button
                  disabled={!canViewTip}
                  onClick={() => onView(tip)}
                >
                  {canViewTip ? 'Ver dica' : `Já viu ${tipsLimit}`}
                </button>

                <p>
                  {tip.replace(/[^ ]/g, "*")}
                </p>
              </div>
            );
          })}
        </div>

        <button className="close-modal-button" onClick={() => setShow(false)}>Sair</button>
      </Modal>
    </>
  );
}
