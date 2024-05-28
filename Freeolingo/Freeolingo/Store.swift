//
//  Store.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation
import SwiftUI

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
    @Published var availableCourses: [AvailableCourse] = []
    @Published var courses: [Course] = []
    @Published var sessionsMap: [String: Session] = [:]
    
    let baseURL = UserDefaults.standard.value(forKey: "base_url") ?? "http://localhost:8080"
    let token = UserDefaults.standard.value(forKey: "duolingo_token") ?? "TOKEN"
    
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
    
    func getAvailableCourses(fromLanguages: [String]) {
        // TODO: Keep this persistent in the app, not just the server

        if !self.availableCourses.isEmpty {
            return
        }
        
        let url = URL(string: "\(baseURL)/getCourseList/\(token)")!
        let task = URLSession.shared.dataTask(with: url) { data, _, _ in
            do {
                let courses = try JSONDecoder().decode([AvailableCourse].self, from: data!)
                DispatchQueue.main.async {
                    self.availableCourses = courses.filter { fromLanguages.contains($0.fromLanguage) }
                }
            } catch {
                print(error)
            }
        }
        task.resume()
    }
    
    func getCourse(languageSettings: LanguageSettings) {
        // TODO: Keep this persistent in the app, not just the server

        if self.courses.contains(where: { $0.fromLanguage == languageSettings.fromLanguage && $0.learningLanguage == languageSettings.learningLanguage }) {
            return
        }

        let path = "getSpecificCourse/\(token)/\(languageSettings.fromLanguage)/\(languageSettings.learningLanguage)"
        let url = URL(string: "\(baseURL)/\(path)")!
        let task = URLSession.shared.dataTask(with: url) { data, _, _ in
            do {
                let course = try JSONDecoder().decode(Course.self, from: data!)
                DispatchQueue.main.async {
                    self.courses.append(course)
                }
            } catch {
                print(error)
            }
        }
        task.resume()
    }
    
    func keyFor(course: Course, section: Section, unit: Unit, level: Level, sessionIndex: Int) -> String {
        let fromLanguage = course.fromLanguage
        let learningLanguage = course.learningLanguage
        let sectionIndex = course.sections.firstIndex(where: { $0.name == section.name }) ?? 0
        let unitIndex = section.units.firstIndex(where: { $0.id == unit.id }) ?? 0
        let levelIndex = unit.levels.firstIndex(where: { $0.id == level.id }) ?? 0
        let path = "getSession/\(token)/\(fromLanguage)/\(learningLanguage)/\(sectionIndex)/\(unitIndex)/\(levelIndex)/\(sessionIndex)"
        return path
    }
    
    func getSession(course: Course, section: Section, unit: Unit, level: Level, sessionIndex: Int) {
        // TODO: Keep this persistent in the app, not just the server
        let path = keyFor(course: course, section: section, unit: unit, level: level, sessionIndex: sessionIndex)

        if self.sessionsMap.keys.contains(path) {
            return
        }
        
        if level.type == LevelType.chest {
            return
        }
        if level.type == LevelType.story {
            return
        }

        let url = URL(string: "\(baseURL)/\(path)")!
        let task = URLSession.shared.dataTask(with: url) { data, _, _ in
            do {
                // TODO: Let's not convert and actually learn how to do this generic stuff in Swift
                // Decode to dictionary
                // Create an id, type, data: rest object and then pass to the decoder
                var json = try JSONSerialization.jsonObject(with: data!, options: []) as? [String: Any]
                let challenges = json!["challenges"] as! [[String: Any]]
                json!["challenges"] = challenges.map { challenge in
                    var convertedChallenge: [String: Any] = [:]
                    convertedChallenge["id"] = challenge["id"]
                    convertedChallenge["type"] = challenge["type"]
                    convertedChallenge["data"] = challenge
                    return convertedChallenge
                }
                do {
                    let jsonData = try JSONSerialization.data(withJSONObject: json as Any, options: [])
                    let session = try JSONDecoder().decode(Session.self, from: jsonData)
                    DispatchQueue.main.async {
                        self.sessionsMap[path] = session
                    }
                } catch {
                    print(error)
                }
            } catch {
                print(error)
            }
        }
        task.resume()
    }
    
    func viewSession(course: Course, section: Section, unit: Unit, level: Level, sessionIndex: Int) {
        getSession(course: course, section: section, unit: unit, level: level, sessionIndex: sessionIndex)
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

func previewStore() -> Store {
    let previewStore = Store()
    previewStore.courses = COURSES
    previewStore.availableCourses = AVAILABLE_COURSES
    return previewStore
}

struct Palette {
    let Primary: Color
    let Background: Color
}

let PALETTE = Palette(
    Primary: Color.teal.darker(by: 0.2),
    Background: Color.gray.lighter(by: 0.95)
)
