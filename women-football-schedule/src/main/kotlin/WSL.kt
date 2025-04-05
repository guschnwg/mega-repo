package com.giovanna.stuff

import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlinx.serialization.*
import kotlinx.serialization.json.*

public fun getWSLMatches(): List<Match> {
    var result = getObject("https://womensleagues.thefa.com/wp-json/api/v1/fixtures/fixtures")
    var matchDay = result.get("fixtures")!!.jsonArray[0].jsonObject
    var rawMatches = matchDay.get("fixtures")!!.jsonArray
    var matches =
            rawMatches.map {
                var rawMatch = it.jsonObject
                var date = rawMatch.get("date").toString().replace("\"", "")
                var time = rawMatch.get("time").toString().replace("\"", "")
                val dateTime = "$date $time"
                val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                val localDateTime = LocalDateTime.parse(dateTime, formatter)

                Match(
                        rawMatch.get("home_team").toString().replace("\"", ""),
                        rawMatch.get("away_team").toString().replace("\"", ""),
                        localDateTime.toInstant(ZoneOffset.UTC),
                        rawMatch.get("total_home_score").toString().replace("\"", "").toIntOrNull(),
                        rawMatch.get("total_away_score").toString().replace("\"", "").toIntOrNull(),
                        "WSL",
                )
            }

    return matches
}
