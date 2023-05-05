import App from '../App';
import finishGame from '../lib/game';

export default function Game() {
  return (<App onFinish={async game => {
    const click = await finishGame(game);
    console.log(click)
  }} />);
}
