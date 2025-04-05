package com.giovanna.stuff

import java.time.Instant
import kotlinx.serialization.*
import kotlinx.serialization.json.*

public fun getUWCLMatches(): List<Match> {
    var result =
            getArray(
                    "https://match.uefa.com/v5/matches?competitionId=28&offset=0&limit=100&phase=ALL&seasonYear=2025"
            )
    var matches =
            result.map {
                var rawMatch = it.jsonObject
                var date = rawMatch.get("kickOffTime")!!.jsonObject
                var home: Int? = null
                var away: Int? = null

                var score = rawMatch.get("score")
                if (score != null) {
                    var totalScore = score.jsonObject.get("total")!!.jsonObject
                    home = totalScore.get("home").toString().toIntOrNull()
                    away = totalScore.get("away").toString().toIntOrNull()
                }
                Match(
                        rawMatch.get("homeTeam")!!
                                .jsonObject
                                .get("internationalName")
                                .toString()
                                .replace("\"", ""),
                        rawMatch.get("awayTeam")!!
                                .jsonObject
                                .get("internationalName")
                                .toString()
                                .replace("\"", ""),
                        Instant.parse(date.get("dateTime").toString().replace("\"", "")),
                        home,
                        away,
                        "UWCL",
                )
            }

    return matches
}
