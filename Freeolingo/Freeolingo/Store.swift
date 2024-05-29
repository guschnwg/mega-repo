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
            if let data = data {
                self.sessionAttempts = try JSONDecoder().decode([SessionAttempt].self, from: data)
                self.sessionAttemptMap = sessionAttempts.reduce(into: self.sessionAttemptMap.self) {
                    $0[$1.sessionId] = $1
                }
            }
        } catch {
            fatalError(error.localizedDescription)
        }
    }
    
    func apiFetch<T: Decodable>(url: URL, onComplete: @escaping (T) -> Void) {
        let task = URLSession.shared.dataTask(with: url) { data, _, _ in
            do {
                if let data = data {
                    let decoded = try JSONDecoder().decode(T.self, from: data)
                    DispatchQueue.main.async {
                        onComplete(decoded)
                    }
                }
            } catch {
                print(error)
            }
        }
        task.resume()
    }
    
    func getAvailableCourses(fromLanguages: [String]) {
        // TODO: Keep this persistent in the app, not just the server

        if !self.availableCourses.isEmpty {
            return
        }
        
        let url = URL(string: "\(baseURL)/getCourseList/\(token)")!
        apiFetch(url: url) { (courses: [AvailableCourse]) in
            self.availableCourses = courses.filter { fromLanguages.contains($0.fromLanguage) }
        }
    }
    
    func getCourse(languageSettings: LanguageSettings) {
        // TODO: Keep this persistent in the app, not just the server

        if self.courses.contains(where: { $0.fromLanguage == languageSettings.fromLanguage && $0.learningLanguage == languageSettings.learningLanguage }) {
            return
        }

        let path = "getSpecificCourse/\(token)/\(languageSettings.fromLanguage)/\(languageSettings.learningLanguage)"
        let url = URL(string: "\(baseURL)/\(path)")!
        apiFetch(url: url) { (course: Course) in
            self.courses.append(course)
        }
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
    
    func getStory(course: Course, section: Section, unit: Unit, level: Level, sessionIndex: Int) {
        
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
            getStory(course: course, section: section, unit: unit, level: level, sessionIndex: sessionIndex)
            return
        }

        let url = URL(string: "\(baseURL)/\(path)")!
        apiFetch(url: url) { (session: Session) in
            self.sessionsMap[path] = session
        }
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
