import {getGames} from '../api/game';
import {getConfig} from '../../utils/config';

export default async function Index({ searchParams }) {
  const config = getConfig(searchParams);
  const { data } = await getGames(
    config.continents,
    config.timeLimit,
    config.guessLimit,
    config.tipsLimit,
  );

  console.log(data);

  return (
    <ol>
      {data.sort((a, b) => a.data.score - b.data.score).map(game => (
        <li>
          {game.name} - {game.data.score}
        </li>
      ))}
    </ol>
  );
}
