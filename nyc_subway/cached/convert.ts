// deno run --allow-read --allow-write convert.ts nyct%2Fgtfs

import GtfsRealtimeBindings from "npm:gtfs-realtime-bindings";

const bytes = await Deno.readFile(Deno.args[0]);
const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(bytes));

Deno.writeFile(`${Deno.args[0]}.json`, new TextEncoder().encode(JSON.stringify(feed, null, 2)));
