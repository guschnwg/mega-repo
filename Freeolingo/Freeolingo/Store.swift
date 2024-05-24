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
    @Published var availableCourses: [AvailableCourse] = []
    @Published var courses: [Course] = []
    
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
        // TODO: Keep this persistent

        if !self.availableCourses.isEmpty {
            return
        }

        let baseURL = "http://localhost:8080"
        let token = UserDefaults.standard.value(forKey: "duolingo_token")!
        let path = "getCourseList/\(token)/"
        
        let url = URL(string: "\(baseURL)/\(path)")!
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
        // TODO: Keep this persistent

        if self.courses.contains(where: { $0.fromLanguage == languageSettings.fromLanguage && $0.learningLanguage == languageSettings.learningLanguage }) {
            return
        }
        
        let baseURL = "http://localhost:8080"
        let token = UserDefaults.standard.value(forKey: "duolingo_token")!
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
    
    func viewSession(course: Course, section: Section, unit: Unit, level: Level, session: Session) {
        print("View session \(session)")
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
