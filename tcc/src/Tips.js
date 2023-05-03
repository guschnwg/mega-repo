import React from "react";
import Modal from 'react-modal';

export function Tips({ show, tips, viewed, tipsLimit, onView, onHide }) {

  const canViewTip = tipsLimit > viewed.length;

  return (
    <>
      <Modal isOpen={show} onRequestClose={onHide}>
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

        <button className="close-modal-button" onClick={onHide}>Sair</button>
      </Modal>
    </>
  );
}
