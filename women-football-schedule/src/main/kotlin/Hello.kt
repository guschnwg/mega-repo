package com.giovanna.stuff

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import kotlin.io.println

fun getAllMatches(): List<Match> {
    var matches =
            getNWSLMatches() +
                    getWSLMatches() +
                    getUWCLMatches() +
                    getItnlMatches() +
                    getBrasileiraoMatches()
    matches = matches.sortedBy { it.date }
    return matches
}

class MyHandler : HttpHandler {
    fun getMatchesHTML(matches: List<Match>): String {
        val response = StringBuilder()
        response.append("<html><body>")
        response.append("<h1>Matches</h1>")
        response.append("<table border='1'>")
        response.append("<tr><th>Date</th><th>League</th><th>Home Team</th><th>Away Team</th></tr>")
        for (match in matches) {
            response.append("<tr>")
            response.append("<td>${match.date}</td>")
            response.append("<td>${match.competition}</td>")
            response.append("<td>${match.homeTeam} (${match.homeScore ?: " "})</td>")
            response.append("<td>(${match.awayScore ?: " "}) ${match.awayTeam}</td>")
            response.append("</tr>")
        }
        response.append("</table>")
        response.append("</body></html>")
        return response.toString()
    }

    override fun handle(t: HttpExchange) {
        val matches = getAllMatches()
        val response = getMatchesHTML(matches)

        val responseByteArray = response.toByteArray(Charsets.UTF_8)

        t.responseHeaders.add("Content-Type", "text/html; charset=UTF-8")
        t.sendResponseHeaders(200, responseByteArray.size.toLong())

        val os = t.responseBody
        os.write(responseByteArray)
        os.close()
    }
}

fun main() {
    val server = HttpServer.create(InetSocketAddress(8087), 0)
    server.createContext("/hello", MyHandler())
    server.executor = null
    server.start()
    println("Server started on port 8087")
    println("Press Enter to stop the server...")
    readLine()
    server.stop(0)
    println("Server stopped")
}
