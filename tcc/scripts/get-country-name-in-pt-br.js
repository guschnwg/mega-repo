const fs = require('fs');

async function run() {
  const contResponse = await fetch('https://raw.githubusercontent.com/i-rocky/country-list-js/master/data/continents.json');
  const continents = await contResponse.json();

  const mapResponse = await fetch('https://raw.githubusercontent.com/i-rocky/country-list-js/master/data/continent.json');
  const countryMap = await mapResponse.json();

  const data = fs.readFileSync('../src/world.json', 'utf8');
  const world = JSON.parse(data);

  for (const country of world) {
    console.log(country.id);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?country=${country.title}&accept-language=pt-BR&format=json`);
    const data = await response.json();
    if (!data || !data.length) {
      console.log("skipped " + country.title);
      continue;
    }

    delete country.title;
    country.name = data[0].display_name;

    const countryContinent = countryMap[country.id];
    country.continent = continents[countryContinent] || "Not found";
  }

  fs.writeFileSync('../src/world.json', JSON.stringify(world, null, 2));
}

run();
