//
//  Store.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation

struct SingleAttempt: Codable {
    let started: Date
    let finished: Date?
    let passed: Bool
}

struct SessionAttempt : Codable, Identifiable {
    let id: Int
    let courseId: String
    let sectionId: Int
    let unitId: Int
    let levelId: String
    let sessionId: String
    let viewed: Bool
    let passed: Bool
    let attemps: Array<SingleAttempt>
}

class Store: ObservableObject {
    @Published var sessionAttempts: [SessionAttempt] = []
    @Published var sessionAttemptMap: [String: SessionAttempt] = [:]
    
    private static func fileURL() throws -> URL {
        try FileManager.default.url(for: .documentDirectory,
                                    in: .userDomainMask,
                                    appropriateFor: nil,
                                    create: false)
        .appendingPathComponent("my.data")
    }
    
    func load() {
        do {
            let fileURL = try Self.fileURL()
            let data = try? Data(contentsOf: fileURL)
            if (data != nil) {
                self.sessionAttempts = try JSONDecoder().decode([SessionAttempt].self, from: data!)
                self.sessionAttemptMap = sessionAttempts.reduce(into: self.sessionAttemptMap.self) {
                    $0[$1.sessionId] = $1
                }
            }
        } catch {
            fatalError(error.localizedDescription)
        }
        
    }
    
    func save() {
        do {
            let data = try JSONEncoder().encode(self.sessionAttempts)
            let outfile = try Self.fileURL()
            try data.write(to: outfile)
        } catch {
            fatalError(error.localizedDescription)
        }
    }
}
