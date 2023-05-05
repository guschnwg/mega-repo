import React, { useState } from "react";

const TheGame = () => (
  <div>
    <h1>O Jogo</h1>

    <p>Neste jogo aprenderemos um pouco de História e Geografia</p>

    <p>Também é falado um pouco sobre a cultura de cada lugar</p>

    <p>O objetivo é descobrir qual país de cada nível.</p>
    <p>Para isso você entrará no jogo como se fosse uma pessoa na rua nesse país.</p>

    <p>
      Você estará andando por algum local importante do país,
      que pode ser um marco histórico ou apenas um local turístico.
    </p>

    <p>
      O primeiro nível é apenas um tutorial, e não há limite de tempo ou de palpites.
      Mas ainda tem limite de dicas.
    </p>
  </div>
);


const Time = ({ limit }) => (
  <div>
    <h1>O Cronômetro</h1>

    <p>Para ser um jogo mais interessante, adicionamos um tempo para que você tenha uma dificuldade extra.</p>

    <p>Você terá {limit} segundos para se movimentar pelo jogo.</p>

    <p>O tempo pausará enquanto você estiver vendo as dicas ou vendo o mapa para dar um palpite.</p>
  </div>
);

const Navigation = () => (
  <div>
    <h1>Como se mover</h1>

    <p>Dentro do jogo, você estará vendo a vista da rua do lugar que você tem que acertar.</p>

    <p>
      Você pode usar o mouse como forma de navegação, clicando e movendo o mouse para movimentar a câmera.
      E clicar nas setas que aparecerem pelo chão para se movimentar.
    </p>

    <p>
      Você pode usar as setas ⬆️ ⬇️ ➡️ ⬅️ do teclado para se virar e para andar pelo jogo,
      isso é útil para quando você está atrás de informações sobre o local,
      e a posição atual não está ajudando.
    </p>

    <p>
      Você pode usar os botões de ➕ e ➖ para se aproximar ou afastar,
      isso é útil para conseguir ler melhor alguma informação da tela.
    </p>
  </div>
);

const Tips = ({ limit }) => (
  <div>
    <h1>Dicas</h1>

    <p>No botão de <div className='fake-button'>Dicas</div>, você terá 10 fatos históricos, geográficos e/ou curiosidades sobre o país.</p>

    <p>Enquanto estiver vendo as dicas, o cronômetro parará, mas você terá 30 segundos para escolher e ler.</p>

    <p>Ao final desses 30 segundos a janela fechará e você terá que abrir de novo caso queira ler novamente.</p>

    <p>Você tem um limite de {limit} dicas disponíveis para ler, então escolha com sabedoria quais você vai revelar.</p>

    <p>Não precisa se preocupar, por ao fim do nível você poderá ver todas com calma, para aprender mais sobre o local.</p>
  </div>
);

const Guess = ({ limit }) => (
  <div>
    <h1>Palpite</h1>

    <p>No botão de <div className='fake-button'>Já sei!</div>, você terá a possibilidade de dar um palpite.</p>

    <p>Ao todo você terá {limit} palpites disponiveis.</p>

    <p>
      Um mapa abrirá e você poderá escolher um país para sua tentativa, e você terá 30 ssegundos para escolher,
      e caso esse tempo esgote, você poderá abrir a janela novamente para escolher, sem perder palpites.
    </p>

    <p>
      Caso o país esteja correto, então você vai receber uma mensagem de sucesso
      com as informações sobre o palpite, quanto tempo levou e quantas dicas foram necessárias.
    </p>

    <p>
      Caso o país selecionado não for o correto, ele aparecerá em vermelho no mapa,
      e você poderá tentar novamente, se ainda tiver palpites restantes.
    </p>

    <p>
      Ao final dos palpites, caso não tenha acertado,
      você ainda poderá ver qual país é o local e as curiosidades.
    </p>
  </div>
);

export function Tutorial({ timeLimit, tipsLimit, guessLimit, onClose, onName }) {
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');

  const steps = {
    game: { label: 'O jogo', comp: <TheGame /> },
    navigation: { label: 'Navegação', comp: <Navigation /> },
    time: { label: 'Tempo', comp: <Time limit={timeLimit} /> },
    tips: { label: 'Dicas ', comp: <Tips limit={tipsLimit} /> },
    guess: { label: 'Palpite', comp: <Guess limit={guessLimit} /> },
  };

  return (
    <div className="tutorial">


      {step === 'name' ? (
        <div className="request-name">
          <h1>
            Olá! Qual o nome do time?
          </h1>

          <input type="text" value={name} onChange={event => setName(event.target.value)} />

          <button onClick={() => {
            if (!name) {
              return;
            }
            onName(name);
            setStep('game');
          }}>Confirmo!</button>
        </div>
      ) : (
        <>
            <button className="close" onClick={onClose}>
              Sair
            </button>

          {steps[step]?.comp}
          <div className="controls">
            {Object.entries(steps).map(([key, data]) => (
              <button
                key={key}
                className={step === key ? 'active' : ''}
                onClick={() => setStep(key)}
              >
                {data.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
