import React, { useState } from "react";
import Modal from 'react-modal';

import { Timer } from './Timer';

export function Tips({ tips, viewed, tipsLimit, onView, onHide }) {
  const [start] = useState(Date.now())
  const canViewTip = tipsLimit > viewed.length;

  return (
    <>
      <Modal isOpen>
        <div className="right-attempt tips-modal">
          {tips.map(tip => {
            if (viewed.includes(tip)) {
              return (
                <div className="tip active" key={tip}>
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

        <button className="close-modal-button" onClick={onHide}>
          Sair

          <Timer
            start={start}
            active
            countdown
            limit={30}
            houses={0}
            hideClock
            onEnd={onHide}
          />
        </button>
      </Modal>
    </>
  );
}
