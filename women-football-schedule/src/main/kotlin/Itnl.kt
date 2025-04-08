package com.giovanna.stuff

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlin.collections.listOf
import kotlin.collections.emptySet

private fun parseMatch(event: JsonObject): Match {
    val dateTime = event.get("date").toString().replace("\"", "")
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'Z'")
    val localDateTime = LocalDateTime.parse(dateTime, formatter)

    val competitors = event.get("competitors")!!.jsonArray
    val home = competitors[0].jsonObject
    val away = competitors[1].jsonObject

    var homeScore: Int? = null
    var awayScore: Int? = null
    if (event.get("completed").toString() == "true") {
        homeScore = home.get("score").toString().replace("\"", "").toIntOrNull()
        awayScore = away.get("score").toString().replace("\"", "").toIntOrNull()
    }

    return Match(
            home.get("displayName").toString().replace("\"", ""),
            away.get("displayName").toString().replace("\"", ""),
            localDateTime.toInstant(ZoneOffset.UTC),
            homeScore,
            awayScore,
            "ITNL",
    )
}

private fun getIntlMatchesForDate(date: LocalDate): List<Match> {
    val formatter = DateTimeFormatter.ofPattern("yyyyMMdd")
    var dateString = formatter.format(date)
    var result = getObject(
            "https://www.espn.co.uk/football/fixtures/_/date/$dateString/league/fifa.friendly.w?_xhr=pageContent"
    )
    var events = result.get("events")!!.jsonObject
    var matches: List<Match> = emptyList()

    events.entries.forEach { entry ->
        var matchesInDay = entry.value.jsonArray
        matches = matches + matchesInDay.map { event -> parseMatch(event.jsonObject) }
    }
    return matches
}

public fun getItnlMatches(): List<Match> {
    var matches: Set<Match> = emptySet()

    var today = LocalDate.now()
    var lastWeek = today.plusDays(-7)
    var nextWeek = today.plusDays(7)

    matches = matches + getIntlMatchesForDate(today)
    matches = matches + getIntlMatchesForDate(nextWeek)
    matches = matches + getIntlMatchesForDate(lastWeek)

    return matches.toList()
}
