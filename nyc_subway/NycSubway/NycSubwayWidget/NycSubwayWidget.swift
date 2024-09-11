//
//  NycSubwayWidget.swift
//  NycSubwayWidget
//
//  Created by Giovanna Zanardini on 07/09/24.
//

import WidgetKit
import SwiftUI
import AppIntents


struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("This is an example widget.")

    @Parameter(title: "First route ID", default: "1")
    var firstRouteId: String
    
    @Parameter(title: "First going to", default: "1")
    var firstGoingTo: String
    
    @Parameter(title: "First time left", default: 1)
    var firstTimeLeft: Int
    
    @Parameter(title: "Second route ID", default: "2")
    var secondRouteId: String
    
    @Parameter(title: "Second going to", default: "2")
    var secondGoingTo: String
    
    @Parameter(title: "Second time left", default: 2)
    var secondTimeLeft: Int
}


struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct NycSubwayWidget: Widget {
    let kind: String = "NycSubwayWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: ConfigurationAppIntent.self,
            provider: Provider()
        ) { entry in
            CanvasView(
                subway: [
                    SubwayInfo(
                        routeId: entry.configuration.firstRouteId,
                        leftFromName: "",
                        goingToName: entry.configuration.firstGoingTo,
                        timeLeft: entry.configuration.firstTimeLeft
                    ),
                    SubwayInfo(
                        routeId: entry.configuration.secondRouteId,
                        leftFromName: "",
                        goingToName: entry.configuration.secondGoingTo,
                        timeLeft: entry.configuration.secondTimeLeft
                    ),
                ],
                cols: COLS - 40
            )
                .containerBackground(.black, for: .widget)
                .padding(.all, -5)
        }
    }
}
