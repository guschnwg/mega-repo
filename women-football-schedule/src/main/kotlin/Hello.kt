package com.giovanna.stuff

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import java.io.File

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

fun getMatchesHTML(matches: List<Match>): String {
    val html = StringBuilder()
    html.append("<html><body>")
    html.append("<h1>Matches</h1>")
    html.append("<table border='1'>")
    html.append("<tr><th>Date</th><th>League</th><th>Home Team</th><th>Away Team</th></tr>")
    for (match in matches) {
        html.append("<tr>")
        html.append("<td>${match.date}</td>")
        html.append("<td>${match.competition}</td>")
        html.append("<td>${match.homeTeam} (${match.homeScore ?: " "})</td>")
        html.append("<td>(${match.awayScore ?: " "}) ${match.awayTeam}</td>")
        html.append("</tr>")
    }
    html.append("</table>")
    html.append("</body></html>")
    return html.toString()
}

class MyHandler : HttpHandler {
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
    // val server = HttpServer.create(InetSocketAddress(8087), 0)
    // server.createContext("/hello", MyHandler())
    // server.executor = null
    // server.start()
    // println("Server started on port 8087")
    // println("Press Enter to stop the server...")
    // readLine()
    // server.stop(0)
    // println("Server stopped")

    val matches = getAllMatches()
    val html = getMatchesHTML(matches)
    File("index.html").printWriter().use { out -> out.println(html) }
}
