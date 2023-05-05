import App from '../../components/App';
import finishGame from '../api/game';

export default function Game() {
  return (
    <App
      onFinish={async (name, game, feedback) => {
        const res = await finishGame(name, game, feedback);
        console.log(res);
      }}
    />
  );
}
