import App, {getConfig, getGame} from '../../components/App';
import finishGame from '../api/game';

export default function Game({ params }) {
  return (
    <App
      {...getConfig(params)}
      countries={getGame(params.continents)}
      onFinish={async (name, game, feedback) => {
        const res = await finishGame(name, game, feedback);
        console.log(res);
      }}
    />
  );
}
