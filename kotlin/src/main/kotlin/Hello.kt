package com.giovanna.stuff

import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.remote.RemoteWebDriver

import java.net.URL

fun main(args: Array<String>) {
    var options = ChromeOptions()
    var driver = RemoteWebDriver(URL("http://host.docker.internal:4444"), options)

    driver.get("https://selenium.dev")

    println(driver.title)

    driver.quit()
}
