package com.giovanna.stuff

import java.time.Instant

public data class Match(
        val homeTeam: String,
        val awayTeam: String,
        val date: Instant,
        val homeScore: Int?,
        val awayScore: Int?,
        val competition: String,
)
