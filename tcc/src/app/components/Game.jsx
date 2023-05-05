import App from '../../components/App';
import finishGame from '../api/game';

export default function Game() {
  return (
    <App
      onFinish={async game => {
        const res = await finishGame(game);
        console.log(res);
      }}
    />
  );
}
