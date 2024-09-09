//
//  Item.swift
//  NycSubway
//
//  Created by Giovanna Zanardini on 18/07/24.
//

import Foundation
import SwiftData

@Model
final class Info {
    var routeId: String
    var leftFrom: String
    var goingTo: String
    var timeLeft: Int

    init(routeId: String, leftFrom: String, goingTo: String, timeLeft: Int) {
        self.routeId = routeId
        self.leftFrom = leftFrom
        self.goingTo = goingTo
        self.timeLeft = timeLeft
    }
}

@Model
final class Station {
    var id: String
    var name: String

    init(id: String, name: String) {
        self.id = id
        self.name = name
    }
}

var sharedModelContainer: ModelContainer = {
    let schema = Schema([Info.self, Station.self])
    let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)

    do {
        return try ModelContainer(for: schema, configurations: [modelConfiguration])
    } catch {
        fatalError("Could not create ModelContainer: \(error)")
    }
}()

func load(path: String, onCompletion: (Data) -> Void) {
    guard let bundlePath = Bundle.main.resourcePath else {
        return
    }
    
    do {
        onCompletion(try Data(contentsOf: URL(fileURLWithPath: bundlePath + path)))
    } catch {
        print(error)
    }
}

func fetch(url: String, onCompletion: @escaping (Data) -> Void) {
    URLSession.shared.dataTask(
        with: URLRequest(url: URL(string: url)!)
    ) { data, response, error in
        onCompletion(data!)
    }.resume()
}

func parseRealtime(data: Data) -> [Info] {
    let stopID = "120S"
    do {
        let feedMessage = try TransitRealtime_FeedMessage(serializedBytes: data)
        
        let info = feedMessage.entity
            .filter {
                $0.tripUpdate.stopTimeUpdate.contains { $0.stopID == stopID }
            }
            .map {
                let time = $0.tripUpdate.arrivalTimeFor(stopID: stopID)!
                let date = Date(timeIntervalSince1970: Double(time))
                
                return Info(
                    routeId: $0.tripUpdate.trip.routeID,
                    leftFrom: $0.tripUpdate.stopTimeUpdate.first?.stopID ?? "",
                    goingTo: $0.tripUpdate.stopTimeUpdate.last?.stopID ?? "",
                    timeLeft: Int(ceil(date.timeIntervalSinceNow / 60))
                )
            }
        
        return info
    } catch {
        print(error)
    }
    
    return []
}

func parseStations(data: Data) -> [Station] {
    let csvString = String(data: data, encoding: .utf8)!.replacing("\"", with: "")
    let rows = csvString.components(separatedBy: "\n")
    let header = rows[0].components(separatedBy: ",")
    
    var allStations: [Station] = []
    
    for row in rows.dropFirst() {
        if row.isEmpty { continue }
        
        let columns = row.components(separatedBy: ",")
        // Map header fields to corresponding values
        var parsedRow: [String: String] = [:]
        for (index, value) in columns.enumerated() {
            parsedRow[header[index]] = value
        }
        
        let stopIds = parsedRow["gtfs_stop_ids"]?.components(separatedBy: "; ")
        for stopId in stopIds! {
            allStations.append(Station(id: stopId, name: parsedRow["stop_name"]!))
        }
    }
    
    return allStations
}

struct SubwayInfo: Codable & Hashable {
    var routeId: String
    var leftFromName: String
    var goingToName: String
    var timeLeft: Int
}
