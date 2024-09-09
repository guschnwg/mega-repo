//
//  NycSubwayApp.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 18/07/24.
//

import SwiftUI
import SwiftData

struct RegularView: View {
    @State var stations: [Station] = []
    @State var realtime: [Info] = []
    
    var body: some View {
        ContentView(
            realtime: realtime,
            stations: stations
        )
        .onAppear {
            // load(path: "/GTFS") {
            fetch(url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs") {
                realtime = parseRealtime(data: $0)
            }
            
            // load(path: "/Stations.csv") {
            fetch(url: "https://data.ny.gov/resource/5f5g-n3cz.csv") {
                stations = parseStations(data: $0)
            }
        }
    }
}

struct SwiftDataView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var realtime: [Info]
    @Query private var stations: [Station]
    
    var body: some View {
        ContentView(
            realtime: realtime,
            stations: stations
        ).onAppear {
            // load(path: "/GTFS") {
            fetch(url: "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs") { data in
                do {
                    try modelContext.transaction {
                        parseRealtime(data: data).forEach { modelContext.insert($0) }
                        try modelContext.save()
                    }
                } catch {}
            }
            
            
            
            // load(path: "/Stations.csv") {
            fetch(url: "https://data.ny.gov/resource/5f5g-n3cz.csv") { data in
                do {
                    try modelContext.transaction {
                        parseStations(data: data).forEach { modelContext.insert($0) }
                        
                        try modelContext.save()
                    }
                    
                } catch {}
            }
        }
    }
}

@main
struct NycSubwayApp: App {
    @State var stations: [Station] = []
    @State var realtime: [Info] = []
    
    init() {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound]) { granted, error in
            guard granted else {
                print("You need the authorization for the push notifications!")
                return
            }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            RegularView()
            //            SwiftDataView()
        }.modelContainer(sharedModelContainer)
    }
}
