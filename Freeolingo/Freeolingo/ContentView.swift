//
//  ContentView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 27/03/24.
//

import SwiftUI
import Foundation

struct ContentView: View {
    let courses: Array<Course>
    @Binding var sessionAttempts: Array<SessionAttempt>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        NavigationView {
            List(courses) { course in
                let fromLanguageName = getLanguageName(identifier: course.fromLanguage)
                let learningLanguageName = getLanguageName(identifier: course.learningLanguage)

                NavigationLink(destination: CourseView(course: course, viewSession: viewSession)) {
                    Text(fromLanguageName + " -> " + learningLanguageName)
                }
            }
        }
        .navigationTitle("Courses")
        
        List(sessionAttempts) { item in
            Text(item.sessionId)
        }
    }
}

struct LevelView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State private var isExpanded = false
    
    var body: some View {
        DisclosureGroup(level.name, isExpanded: $isExpanded) {
            ForEach(level.sessions) { session in
                Text(session.id + " - " + session.type)
                    .onTapGesture {
                        viewSession(course, section, unit, level, session)
                    }
            }
        }
    }
}

struct LevelListView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let levels: Array<Level>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List(levels) { level in
            LevelView(
                course: course,
                section: section,
                unit: unit,
                level: level,
                viewSession: viewSession
            )
        }
    }
}

struct UnitView: View {
    let course: Course
    let section: Section
    let unit: Unit
    @State var sheetOpened: Bool = false
    
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        Text(unit.name).onTapGesture {
            sheetOpened = true
        }
        .sheet(isPresented: $sheetOpened) {
            LevelListView(
                course: course,
                section: section,
                unit: unit,
                levels: unit.levels,
                viewSession: viewSession
            )
            
            Button {
                sheetOpened = false
            } label: {
                Text("X")
            }
        }
    }
}

struct UnitListView: View {
    let course: Course
    let section: Section
    let units: Array<Unit>
    @State var selectedUnit: Unit?
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        ForEach(units) { unit in
            UnitView(course: course, section: section, unit: unit, viewSession: viewSession)
        }
    }
}

struct SessionListItemView: View {
    let course: Course
    let section: Section
    @State private var isExpanded = false
    
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        let firstUnitName = section.units.isEmpty ? "?" : section.units.first!.name
        let title = firstUnitName.isEmpty ? "?" : firstUnitName
        
        DisclosureGroup(title, isExpanded: $isExpanded) {
            UnitListView(course: course, section: section, units: section.units, viewSession: viewSession)
        }
    }
}

struct CourseView: View {
    let course: Course
    @State var selectedSection: Section? = nil
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List(course.sections) { section in
            SessionListItemView(course: course, section: section, viewSession: viewSession)
        }
        .navigationTitle(course.id)
    }
}

//#Preview {
//    ContentView(courses: [], sessionAttempts: []) {
//        print("called it")
//    }
//}
