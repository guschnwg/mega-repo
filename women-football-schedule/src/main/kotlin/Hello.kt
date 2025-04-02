package com.giovanna.stuff

import java.net.URL
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import okhttp3.OkHttpClient
import okhttp3.Request
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.remote.RemoteWebDriver

fun parseJsonToMap(json: String): Map<String, JsonElement> {
    val jsonObject = Json.parseToJsonElement(json).jsonObject
    return jsonObject.mapValues { it.value }
}

fun parseJsonToList(json: String): List<JsonElement> {
    val jsonArray = Json.parseToJsonElement(json).jsonArray
    return jsonArray.map { it }
}

fun main(args: Array<String>) {
    getNWSLMatches()
    getWSLMatches()
    getUWCLMatches()
}

private fun get(url: String): String {
    var client = OkHttpClient()
    var request = Request.Builder().url(url).build()
    var response = client.newCall(request).execute()

    return response.body!!.string()
}

private fun getObject(url: String): Map<String, JsonElement> {
    var data = get(url)
    val result = parseJsonToMap(data)
    return result
}

private fun getArray(url: String): List<JsonElement> {
    var data = get(url)
    val result = parseJsonToList(data)
    return result
}

//

data class Match(
        val homeTeam: String,
        val awayTeam: String,
        val date: Instant,
        val homeScore: Int?,
        val awayScore: Int?,
)

fun getNWSLMatches() {
    var result =
            getObject(
                    "https://api-sdp.nwslsoccer.com/v1/nwsl/football/seasons/nwsl::Football_Season::fad050beee834db88fa9f2eb28ce5a5c/matches?locale=en-US"
            )
    var rawMatches = result.get("matches")!!.jsonArray
    var matches =
            rawMatches.map {
                var rawMatch = it.jsonObject
                Match(
                        rawMatch.get("home")!!.jsonObject.get("officialName").toString(),
                        rawMatch.get("away")!!.jsonObject.get("officialName").toString(),
                        Instant.parse(rawMatch.get("matchDateUtc").toString().replace("\"", "")),
                        rawMatch.get("homeScorePush").toString().toIntOrNull(),
                        rawMatch.get("awayScorePush").toString().toIntOrNull(),
                )
            }

    println(matches[0])
    println(matches.last())
}

fun getWSLMatches() {
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
                        rawMatch.get("home_team").toString(),
                        rawMatch.get("away_team").toString(),
                        localDateTime.toInstant(ZoneOffset.UTC),
                        rawMatch.get("total_home_score").toString().replace("\"", "").toIntOrNull(),
                        rawMatch.get("total_away_score").toString().replace("\"", "").toIntOrNull(),
                )
            }

    println(matches[0])
}

fun getUWCLMatches() {
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
                        rawMatch.get("homeTeam")!!.jsonObject.get("internationalName").toString(),
                        rawMatch.get("awayTeam")!!.jsonObject.get("internationalName").toString(),
                        Instant.parse(date.get("dateTime").toString().replace("\"", "")),
                        home,
                        away,
                )
            }
    println(matches[0])
    println(matches.last())
}

fun selenium() {
    var options = ChromeOptions()
    var driver = RemoteWebDriver(URL("http://host.docker.internal:4444"), options)
    driver.get("https://www.nwslsoccer.com/schedule/regular-season")
    println(driver.title)
    driver.quit()
}
