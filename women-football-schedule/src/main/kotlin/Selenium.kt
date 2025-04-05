package com.giovanna.stuff

import java.net.URL
import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.remote.RemoteWebDriver

fun selenium() {
    var options = ChromeOptions()
    var driver = RemoteWebDriver(URL("http://host.docker.internal:4444"), options)
    driver.get("https://www.nwslsoccer.com/schedule/regular-season")
    println(driver.title)
    driver.quit()
}
