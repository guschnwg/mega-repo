// deno run --allow-net --allow-write --allow-read nyc_subway.ts

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

async function getStations(): Promise<any> {
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
      const station: any = values.reduce((agg, crr, i) => ({ ...agg, [keys[i]]: crr }), {});
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

async function getStationData(stationId: string) {
  const now = Date.now();

  const realtime = await getRealtime();
  const stations = await getStations();

  const station = stations[stationId];
  const stationData: any[] = [];
  for (const trip of realtime) {
    if (trip.tripUpdate?.stopTimeUpdate?.some(stop => stop.stopId?.includes(stationId))) {
      const leftFrom = trip.tripUpdate.stopTimeUpdate[0].stopId?.substring(0, 3) as string;
      const goingTo = trip.tripUpdate.stopTimeUpdate.at(-1)!.stopId?.substring(0, 3) as string;

      stationData.push({
        trip,
        leftFrom: stations[leftFrom],
        goingTo: stations[goingTo],
      });
    }
  }

  // Setting the last one as the current station, just for testing
  const fileContent = Deno.readTextFileSync("nyc_subway.html");
  const updatedFileContent = fileContent.replace(
    /window\.subwayData = [\s\S]*?;\n/,
    `window.subwayData = ${JSON.stringify({ now, station, data: stationData })};\n`
  );
  Deno.writeTextFileSync("nyc_subway.html", updatedFileContent);

  return { now, station, data: stationData };
}

const INDEX_ROUTE = new URLPattern({ pathname: "/" });
const STATION_ROUTE = new URLPattern({ pathname: "/station/:id" });
async function handler(request: Request) {
  if (INDEX_ROUTE.exec(request.url)) {
    const fileContent = Deno.readTextFileSync("nyc_subway.html");
    return new Response(fileContent, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  const stationMatch = STATION_ROUTE.exec(request.url);
  if (stationMatch?.pathname.groups.id) {
    const data = await getStationData(stationMatch.pathname.groups.id);
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
      },
    });
  }

  return new Response("Not found", { status: 404 });
}

Deno.serve({ hostname: '0.0.0.0', port: 8080 }, handler);