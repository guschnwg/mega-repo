package com.giovanna.stuff

import org.openqa.selenium.chrome.ChromeOptions
import org.openqa.selenium.chrome.ChromeDriver

fun main(args: Array<String>) {
    var options = ChromeOptions()

    options.addArguments("--headless=new")

    val driver = ChromeDriver(options)

    driver.get("https://selenium.dev")

    println(driver.title)

    driver.quit()
}
