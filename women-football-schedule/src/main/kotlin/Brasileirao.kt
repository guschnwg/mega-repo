package com.giovanna.stuff

import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlinx.serialization.*
import kotlinx.serialization.json.*

private fun getIntlMatchesForRound(round: Int): List<Match> {
    var result =
            getArray(
                    "https://api.globoesporte.globo.com/tabela/fd4a45f6-71df-49ba-9dc3-b352d71d715c/fase/primeira-fase-campeonato-brasileiro-feminino-2025/rodada/$round/jogos/"
            )

    return result.map {
        var rawMatch = it.jsonObject
        var teams = rawMatch.get("equipes")!!.jsonObject

        var home = rawMatch.get("placar_oficial_mandante").toString().toIntOrNull()
        var away = rawMatch.get("placar_oficial_visitante").toString().toIntOrNull()

        var dateTime = rawMatch.get("data_realizacao").toString().replace("\"", "")
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")
        val localDateTime = LocalDateTime.parse(dateTime, formatter)

        Match(
                teams.get("mandante")!!.jsonObject.get("nome_popular").toString().replace("\"", ""),
                teams.get("visitante")!!
                        .jsonObject
                        .get("nome_popular")
                        .toString()
                        .replace("\"", ""),
                localDateTime.toInstant(ZoneOffset.ofHours(-3)),
                home,
                away,
                "Brasileirão",
        )
    }
}

public fun getBrasileiraoMatches(): List<Match> {
    var matches: Set<Match> = emptySet()

    var round = 1
    var newMatches = getIntlMatchesForRound(round)
    while (newMatches.isNotEmpty()) {
        matches = matches + newMatches
        newMatches = getIntlMatchesForRound(++round)
    }

    return matches.toList()
}
