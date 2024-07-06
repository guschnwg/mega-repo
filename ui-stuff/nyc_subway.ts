import GtfsRealtimeBindings from "npm:gtfs-realtime-bindings";

async function getRealtime() {
  const urls = [
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
    "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si",
  ]

  const data: GtfsRealtimeBindings.transit_realtime.IFeedEntity[] = [];
  for (const url of urls) {
    const response = await fetch(url, { headers: {} });
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)).entity;
      data.push(...feed);
    }
  }

  // Write to file
  Deno.writeTextFile("nyc_subway/realtime.json", JSON.stringify(data, null, 2));

  return data;
}

async function getStations() {
  const response = await fetch(
    "https://data.ny.gov/resource/5f5g-n3cz.csv",
    { headers: {} },
  );
  if (response.ok) {
    const data = await response.text();

    const [header, ...rows] = data.split("\n");
    const keys = header.split(",").map(key => key.replace(/"/g, "").trim());

    const json = rows.reduce((acc, row) => {
      const values = row.split(",").map(value => value.replace(/"/g, "").trim());
      const station = values.reduce((agg, crr, i) => ({ ...agg, [keys[i]]: crr }), {});
      if (!station.gtfs_stop_ids) {
        return acc;
      }

      const stationIds = station.gtfs_stop_ids.split("; ");
      const toAdd = stationIds.reduce((agg: object, crr: string) => ({ ...agg, [crr]: station }), {});
      return { ...acc, ...toAdd };
    }, {});

    Deno.writeTextFile("nyc_subway/stations.csv", data);
    Deno.writeTextFile("nyc_subway/stations.json", JSON.stringify(json, null, 2));

    return json;
  }
}

let realtime = await getRealtime();
let stations = await getStations();

// console.log("Get all trips for the station 120 96 St");

// const stationId = "120";
// const station = stations[stationId];
// for (const trip of realtime) {
//   if (trip.tripUpdate?.stopTimeUpdate?.some(stop => stop.stopId.includes(stationId))) {
//     console.log(trip.tripUpdate.trip.routeId)

//     const leftFrom = trip.tripUpdate.stopTimeUpdate[0].stopId?.substring(0, 3);
//     console.log("Left from station", stations[leftFrom]?.stop_name);

//     const goingTo = trip.tripUpdate.stopTimeUpdate.at(-1).stopId?.substring(0, 3);
//     console.log("Going to station", stations[goingTo]?.stop_name);

//     // const goingTo = trip.tripUpdate.trip.tripId?.split('..')[1].substring(0, 3);
//     // console.log("Going to station", stations[goingTo]?.stop_name ?? trip.tripUpdate.trip.tripId);
//     // console.log(trip);
//   }
// }

// Write this in the nyc_subway.html file replacing the line that starts with `var subwayData`
// <script>
// var subwayData = {
//   realtime: JSON.parse(` + JSON.stringify(realtime) + `),
//   stations: JSON.parse(` + JSON.stringify(stations) + `),
// };
// </script>

// const fileContent = Deno.readTextFileSync("nyc_subway.html");
// const updatedFileContent = fileContent.replace(/var subwayData = {[\s\S]*?};/, subwayDataScript);
// Deno.writeTextFileSync("nyc_subway.html", updatedFileContent);