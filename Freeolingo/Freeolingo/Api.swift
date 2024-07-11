//
//  Api.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation
import SwiftUI

private struct ApiData: Codable {
    var availableCourses: [AvailableCourse]
    var courses: [Course]
    var sessionsMap: [String: Session]
    var storiesMap: [String: Story]
}

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
    
    //
    
    private static func fileURL(_ path: String) throws -> URL {
        var items = path.split(separator: "/")
        items.remove(at: 1)
        
        var url = try FileManager.default.url(for: .documentDirectory,
                                    in: .userDomainMask,
                                    appropriateFor: nil,
                                    create: true)

        url = url.appendingPathComponent(items.joined(separator: "|"))
        
        return url
    }
    
    func loadFrom<T: Decodable>(_ type: T.Type, _ path: String) async -> Optional<T> {
        let task = Task<Optional<T>, Error> {
            let fileURL = try Self.fileURL(path)
            guard let data = try? Data(contentsOf: fileURL) else {
                return nil
            }
            do {
                let stateData = try JSONDecoder().decode(type, from: data)
                return stateData
            } catch {
                return nil
            }
        }
        
        do {
            let object = try await task.value
            return object
        } catch {
            return nil
        }
    }
    
    @MainActor private func save(_ path: String, _ data: Data) async {
        Task {
            let outfile = try Self.fileURL(path)
            do {
                try data.write(to: outfile)
            } catch {
                print("Error saving file \(error)")
            }
        }
    }
    
    //
    
    func apiFetch<T: Decodable>(_ type: T.Type, _ path: String) async -> (Optional<T>, Optional<Data>) {
        var request = URLRequest(url: URL(string: "\(baseURL)/\(path)")!)
        for header in headers {
            let components = header.components(separatedBy: ":")
            if components.count == 2 {
                let key = components[0].trimmingCharacters(in: .whitespacesAndNewlines)
                let value = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
                request.setValue(value, forHTTPHeaderField: key)
            }
        }

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let decoded = try JSONDecoder().decode(T.self, from: data)
            return (decoded, data)
        } catch {
            return (nil, nil)
        }
    }
    
    func localOrFetch<T: Decodable>(_ type: T.Type, _ path: String) async -> Optional<T> {
        if let data = await loadFrom(type.self, path) {
            print("Found in local storage")
            return data
        }

        print("Calling the API")
        let (toReturn, data) = await apiFetch(T.self, path)
        if let data = data {
            await save(path, data)
        }
        return toReturn
    }
    
    //
    
    func getAvailableCourses(fromLanguages: [String]) {
        if !self.availableCourses.isEmpty {
            return
        }
        
        Task {
            let path = "getCourseList/\(token)"
            if let availableCourses = await localOrFetch([AvailableCourse].self, path) {
                await MainActor.run {
                    self.availableCourses = availableCourses.filter { fromLanguages.contains($0.fromLanguage) }
                }
            }
        }
    }
    
    func getCourse(languageSettings: LanguageSettings) {
        if self.courses.contains(
            where: { $0.fromLanguage == languageSettings.fromLanguage && $0.learningLanguage == languageSettings.learningLanguage }
        ) {
            return
        }

        Task {
            let path = "getSpecificCourse/\(token)/\(languageSettings.fromLanguage)/\(languageSettings.learningLanguage)"
            if let course = await localOrFetch(Course.self, path) {
                await MainActor.run {
                    self.courses.append(course)
                }
            }
        }
    }
    
    func getStory(course: Course, section: Section, unit: Unit, level: Level) {
        // TODO: Keep this persistent in the app, not just the server

        let storyId = level.pathLevelMetadata?.storyId ?? "i-dont-know"
        let path = "getStory/\(token)/\(storyId)"
        let pathTwo = keyFor(course, section, unit, level, 0)

        if self.storiesMap.keys.contains(path) {
            return
        }

        Task {
            if let story = await localOrFetch(Story.self, path) {
                await MainActor.run {
                    self.storiesMap[path] = story
                    self.storiesMap[pathTwo] = story
                }
            }
        }
    }
    
    func keyFor(_ course: Course, _ section: Section, _ unit: Unit, _ level: Level, _ sessionIndex: Int) -> String {
        let fromLanguage = course.fromLanguage
        let learningLanguage = course.learningLanguage
        let sectionIndex = course.sections.firstIndex(of: section) ?? 0
        let unitIndex = section.units.firstIndex(of: unit) ?? 0
        let levelIndex = unit.levels.firstIndex(of: level) ?? 0

        let actualIndex = level.type == .story ? 0 : sessionIndex

        return "getSession/\(token)/\(fromLanguage)/\(learningLanguage)/\(sectionIndex)/\(unitIndex)/\(levelIndex)/\(actualIndex)"
    }
    
    func getSession(course: Course, section: Section, unit: Unit, level: Level, sessionIndex: Int) {
        let path = keyFor(course, section, unit, level, sessionIndex)

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

        Task {
            if let session = await localOrFetch(Session.self, path) {
                await MainActor.run {
                    self.sessionsMap[path] = session
                }
            }
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
