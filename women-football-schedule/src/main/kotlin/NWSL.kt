package com.giovanna.stuff

import java.time.Instant
import kotlinx.serialization.*
import kotlinx.serialization.json.*

public fun getNWSLMatches(): List<Match> {
    var result =
            getObject(
                    "https://api-sdp.nwslsoccer.com/v1/nwsl/football/seasons/nwsl::Football_Season::fad050beee834db88fa9f2eb28ce5a5c/matches?locale=en-US"
            )
    var rawMatches = result.get("matches")!!.jsonArray
    var matches =
            rawMatches.map {
                var rawMatch = it.jsonObject
                Match(
                        rawMatch.get("home")!!.jsonObject.get("officialName").toString().replace("\"", ""),
                        rawMatch.get("away")!!.jsonObject.get("officialName").toString().replace("\"", ""),
                        Instant.parse(rawMatch.get("matchDateUtc").toString().replace("\"", "")),
                        rawMatch.get("homeScorePush").toString().toIntOrNull(),
                        rawMatch.get("awayScorePush").toString().toIntOrNull(),
                        "NWSL",
                )
            }

    return matches
}
