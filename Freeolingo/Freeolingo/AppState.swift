//
//  State.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 28/06/24.
//

import Foundation

private struct StateData: Codable {
    var completed: [String]
    var currentSessionFor: [String: Int]
}

class AppState: ObservableObject {
    private var completed: [String] = []
    private var currentSessionFor: [String: Int] = [:]
    
    private static func fileURL() throws -> URL {
        try FileManager.default.url(for: .documentDirectory,
                                    in: .userDomainMask,
                                    appropriateFor: nil,
                                    create: false)
        .appendingPathComponent("freeolingo.state.data")
    }
    
    func load() async throws {
        let task = Task<StateData, Error> {
            let fileURL = try Self.fileURL()
            guard let data = try? Data(contentsOf: fileURL) else {
                return StateData(completed: [], currentSessionFor: [:])
            }
            do {
                let stateData = try JSONDecoder().decode(StateData.self, from: data)
                return stateData
            } catch {
                print(error)
                return StateData(completed: [], currentSessionFor: [:])
            }
        }

        let data = try await task.value
        self.completed = data.completed
        self.currentSessionFor = data.currentSessionFor
    }
    
    private func save() async {
        let stateData = StateData(
            completed: completed,
            currentSessionFor: currentSessionFor
        )
        let task = Task {
            let data = try JSONEncoder().encode(stateData)
            let outfile = try Self.fileURL()
            try data.write(to: outfile)
        }
        do {
            _ = try await task.value
        } catch {
            print(error)
        }
    }
    
    //

    func isAvailable(course: Course, section: Section) -> Bool {
        let sectionIndex = course.sections.firstIndex(of: section)!
        
        // First section in a course is available
        if sectionIndex == 0 {
            return true
        }
        
        // Last section complete
        if completed.contains("\(course.id)|\(sectionIndex - 1)") {
            return true
        }
        
        return false
    }
    
    func isAvailable(course: Course, section: Section, unit: Unit) -> Bool {
        let sectionIndex = course.sections.firstIndex(of: section)!
        let unitIndex = section.units.firstIndex(of: unit)!
        
        // First unit
        if unitIndex == 0 {
            return isAvailable(course: course, section: section)
        }
        
        // If this is already complete
        if completed.contains("\(course.id)|\(sectionIndex)|\(unitIndex)") {
            return true
        }
        
        // Previous unit complete
        if completed.contains("\(course.id)|\(sectionIndex)|\(unitIndex - 1)") {
            return true
        }
        
        return false
    }
    
    func isAvailable(course: Course, section: Section, unit: Unit, level: Level) -> Bool {
        let sectionIndex = course.sections.firstIndex(of: section)!
        let unitIndex = section.units.firstIndex(of: unit)!
        let levelIndex = unit.levels.firstIndex(of: level)!
        
        // First level
        if levelIndex == 0 {
            return isAvailable(course: course, section: section, unit: unit)
        }
        
        // If this is already complete
        if completed.contains("\(course.id)|\(sectionIndex)|\(unitIndex)|\(levelIndex)") {
            return true
        }
        
        // Previous level complete
        if completed.contains("\(course.id)|\(sectionIndex)|\(unitIndex)|\(levelIndex - 1)") {
            return true
        }
        
        return false
    }
    
    //
    
    func complete(_ course: Course, _ section: Section, _ unit: Unit, _ level: Level) async {
        let sectionIndex = course.sections.firstIndex(of: section)!
        let unitIndex = section.units.firstIndex(of: unit)!
        let levelIndex = unit.levels.firstIndex(of: level)!
        completed.append("\(course.id)|\(sectionIndex)|\(unitIndex)|\(levelIndex)")
        await save()
    }
    
    //
    
    func currentSession(_ course: Course, _ section: Section, _ unit: Unit, _ level: Level) -> Int {
        let sectionIndex = course.sections.firstIndex(of: section)!
        let unitIndex = section.units.firstIndex(of: unit)!
        let levelIndex = unit.levels.firstIndex(of: level)!

        let key = "\(course.id)|\(sectionIndex)|\(unitIndex)|\(levelIndex)"

        if let currentSession = currentSessionFor[key] {
            return currentSession
        }

        return 0
    }
    
    func completeSession(_ course: Course, _ section: Section, _ unit: Unit, _ level: Level, _ index: Int) async -> Int {
        let sectionIndex = course.sections.firstIndex(of: section)!
        let unitIndex = section.units.firstIndex(of: unit)!
        let levelIndex = unit.levels.firstIndex(of: level)!

        let key = "\(course.id)|\(sectionIndex)|\(unitIndex)|\(levelIndex)"
        currentSessionFor[key] = index + 1
        
        await save()

        return index + 1
    }
}


func previewState() -> AppState {
    let previewState = AppState()
//    previewState.completedSections = [0]
//    previewState.completedUnits = [1, 2, 3]
    return previewState
}
