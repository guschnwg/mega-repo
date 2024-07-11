//
//  Api.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation
import SwiftUI

class Api: ObservableObject {
    @Published var availableCourses: [AvailableCourse] = []
    @Published var courses: [Course] = []
    @Published var sessionsMap: [String: Session] = [:]
    @Published var storiesMap: [String: Story] = [:]
    
    let baseURL = UserDefaults.standard.string(forKey: "base_url") ?? "http://localhost:8080"
    let token = UserDefaults.standard.string(forKey: "duolingo_token") ?? "TOKEN"
    let headers = [
        UserDefaults.standard.string(forKey: "header_one") ?? "Key-One: Value",
        UserDefaults.standard.string(forKey: "header_two") ?? "Key-Two: Value"
    ]
    
    func apiFetch<T: Decodable>(url: URL, onComplete: @escaping (T) -> Void) {
        var request = URLRequest(url: url)
        for header in headers {
            let components = header.components(separatedBy: ":")
            if components.count == 2 {
                let key = components[0].trimmingCharacters(in: .whitespacesAndNewlines)
                let value = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        let task = URLSession.shared.dataTask(with: request) {data, response, error in
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
    
    func getStory(course: Course, section: Section, unit: Unit, level: Level) {
        // TODO: Keep this persistent in the app, not just the server

        let storyId = level.pathLevelMetadata?.storyId ?? "i-dont-know"
        let path = "getStory/\(token)/\(storyId)"

        if self.storiesMap.keys.contains(path) {
            return
        }

        let url = URL(string: "\(baseURL)/\(path)")!
        apiFetch(url: url) { (story: Story) in
            self.storiesMap[path] = story
        }
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
            getStory(course: course, section: section, unit: unit, level: level)
            return
        }

        let url = URL(string: "\(baseURL)/\(path)")!
        apiFetch(url: url) { (session: Session) in
            self.sessionsMap[path] = session
        }
    }
}

func previewApi() -> Api {
    let previewApi = Api()
    previewApi.courses = COURSES
    previewApi.availableCourses = AVAILABLE_COURSES
    previewApi.sessionsMap["getSession/TOKEN/pt/en/0/0/0/0"] = SESSIONS[0]
    return previewApi
}

struct Palette {
    let Primary: Color
    let Background: Color
}

let PALETTE = Palette(
    Primary: Color.teal.darker(by: 0.2),
    Background: Color.gray.lighter(by: 0.95)
)
