package com.giovanna.stuff

import kotlinx.serialization.*
import kotlinx.serialization.json.*
import okhttp3.OkHttpClient
import okhttp3.Request

private fun parseJsonToMap(json: String): Map<String, JsonElement> {
    val jsonObject = Json.parseToJsonElement(json).jsonObject
    return jsonObject.mapValues { it.value }
}

private fun parseJsonToList(json: String): List<JsonElement> {
    val jsonArray = Json.parseToJsonElement(json).jsonArray
    return jsonArray.map { it }
}

public fun get(url: String): String {
    var client = OkHttpClient()
    var request = Request.Builder().url(url).build()
    var response = client.newCall(request).execute()

    return response.body!!.string()
}

public fun getObject(url: String): Map<String, JsonElement> {
    var data = get(url)
    val result = parseJsonToMap(data)
    return result
}

public fun getArray(url: String): List<JsonElement> {
    var data = get(url)
    val result = parseJsonToList(data)
    return result
}
