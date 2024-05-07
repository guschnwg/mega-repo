//
//  ContentView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 27/03/24.
//

import SwiftUI
import Foundation
import AVFoundation

let colors = [
    Color.red,
    Color.blue,
    Color.yellow,
    Color.orange,
    Color.pink,
    Color.brown,
    Color.cyan,
    Color.mint,
    Color.purple,
    Color.green,
]

func getColor(index: Int, exclude: Color? = nil) -> Color {
    let available = (exclude != nil) ? colors.filter { $0 != exclude } : colors
    return available[index % available.count]
}

struct SessionChallengesView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let session: Session

    let finishSession: () -> Void
    
    @State private var currentChallenge = 12
    
    var body: some View {
        VStack {
            Text("Session \(level.sessions.firstIndex(of: session)! + 1)/\(level.sessions.count)")
            Text("Challenge \(currentChallenge + 1)/\(session.challenges.count)")

            ChallengeView(
                languageSettings: LanguageSettings(
                    fromLanguage: course.fromLanguage,
                    learningLanguage: course.learningLanguage
                ),
                challenge: session.challenges[currentChallenge],
                onComplete: {isCorrect in
                    if !isCorrect {
                        // Add the same challenge in the end so we can retry?
                    }

                    if session.challenges.indices.contains(currentChallenge + 1) {
                        currentChallenge += 1
                    } else {
                        finishSession()
                        currentChallenge = 0
                    }
                }
            )
        }
    }
}

struct SessionView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let session: Session

    let finishSession: () -> Void
    
    @State private var isPresented = false
    
    var body: some View {
        Button("Start") {
            isPresented = true
        }.sheet(isPresented: $isPresented) {
            SessionChallengesView(
                course: course,
                section: section,
                unit: unit,
                level: level,
                session: session,
                finishSession: finishSession
            )
        }
    }
}

struct LevelView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State private var isPresented = false
    @State private var currentSession = 0
    
    func finishSession() -> Void {
        if level.sessions.indices.contains(currentSession + 1) {
            currentSession += 1
        } else {
            isPresented = false
        }
    }
    
    var body: some View {
        Text(level.name)
        .onTapGesture {
            isPresented = true
            viewSession(course, section, unit, level, level.sessions[currentSession])
        }.popover(isPresented: $isPresented) {
            Text("\(currentSession + 1)/\(level.sessions.count)")
            
            if #available(iOS 16.4, *) {
                SessionView(
                    course: course,
                    section: section,
                    unit: unit,
                    level: level,
                    session: level.sessions[currentSession],
                    finishSession: finishSession
                ).presentationCompactAdaptation((.popover))
                    .frame(width: 300, height: 200)
            } else {
                SessionView(
                    course: course,
                    section: section,
                    unit: unit,
                    level: level,
                    session: level.sessions[currentSession],
                    finishSession: finishSession
                )
            }
        }
    }
}

struct SectionView: View {
    let course: Course
    let section: Section
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List {
            ForEach(section.units.indices, id: \.self) { index in
                let unit = section.units[index]
                let color = getColor(index: index)

                VStack(spacing: 0) {
                    Text(unit.name).frame(height: 100).font(.system(size: 20))
                    
                    List {
                        ForEach(unit.levels.indices, id: \.self) { levelIndex in
                            let level = unit.levels[levelIndex]
                            let levelColor = getColor(index: levelIndex, exclude: color)
                            
                            LevelView(
                                course: course,
                                section: section,
                                unit: unit,
                                level: level,
                                viewSession: viewSession
                            ).listRowSeparator(.hidden)
                                .listRowBackground(levelColor)
                        }
                    }.listStyle(.plain)
                        .environment(\.defaultMinListRowHeight, 60)

                }.listRowBackground(color)
                    .listRowSeparator(.hidden)
                    .frame(height: CGFloat(100 + unit.levels.count * 60))
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Units")
            .listStyle(.plain)
    }
}

struct CourseView: View {
    let course: Course
    @State var selectedSection: Section? = nil
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        List {
            ForEach(course.sections.indices, id: \.self) { index in
                let section = course.sections[index]
                NavigationLink(destination: SectionView(course: course, section: section, viewSession: viewSession)) {
                    VStack(alignment: .leading) {
                        Text(section.name).font(.system(size: 24))
                        
                        let firstUnitName = section.units.isEmpty ? "?" : section.units.first!.name
                        let title = firstUnitName.isEmpty ? "?" : firstUnitName
                        
                        Text(title).font(.system(size: 14))
                    }
                }.listRowBackground(colors[index % colors.count])
                    .listRowSeparator(.hidden)
            }
        }.navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Sections")
            .environment(\.defaultMinListRowHeight, 100)
            .listStyle(.plain)
    }
}

struct CoursesListView : View {
    let courses: Array<Course>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    var body: some View {
        let color = Color.red
        
        List {
            ForEach(courses.indices, id: \.self) { index in
                let course = courses[index]
                
                let brightness = Double(Double(index) * Double(1) / Double(courses.count + 3))
                let rowColor = color.brightness(brightness)
                
                let fromLanguageName = getLanguageName(identifier: course.fromLanguage)
                let learningLanguageName = getLanguageName(identifier: course.learningLanguage)
                
                NavigationLink(destination: CourseView(course: course, viewSession: viewSession)) {
                    Text(fromLanguageName + " -> " + learningLanguageName)
                        .font(.system(size: 24))
                }.listRowBackground(rowColor)
                    .listRowSeparator(.hidden)
            }
        }.navigationTitle("Courses")
            .environment(\.defaultMinListRowHeight, 100)
            .listStyle(.plain)
    }
}

struct AllQuestionsView: View {
    let courses: [Course]
    @State private var types: [String: Array<Challenge>] = [:]
    
    init(courses: [Course]) {
        self.courses = courses
        types = getQuestionTypesMap(courses: courses)
    }
    
    var body: some View {
        if types.isEmpty {
            Button("Load") {
                types = getQuestionTypesMap(courses: courses)
            }
        } else {
            List {
                ForEach(types.keys.sorted(), id: \.self) { type in
                    NavigationLink(
                        destination: ChallengeView(
                            languageSettings: LanguageSettings(
                                fromLanguage: courses[0].fromLanguage,
                                learningLanguage: courses[0].learningLanguage
                            ),
                            challenge: (types[type]?.randomElement())!,
                            onComplete: {_ in }
                        )
                    ) {
                        Text("\(type) - \(types[type]!.count)")
                    }
                }
            }
        }
    }
}

struct ContentView: View {
    let courses: Array<Course>
    let viewSession: (Course, Section, Unit, Level, Session) -> Void
    
    @State var state: Int = 0
    
    var body: some View {
        if courses.count == 0 {
            Text("No courses")
        } else {
            NavigationStack {
                CoursesListView(courses: courses, viewSession: viewSession)
                
                NavigationLink(destination: AllQuestionsView(courses: courses)) {
                    Text("AllQuestionsView")
                }
            }.padding(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
        }
    }
}


#Preview {
    let challenges: [Challenge] = []
    
    let sessions = [
        Session(id: "1", type: "LESSON", challenges: challenges),
        Session(id: "2", type: "LESSON", challenges: challenges),
        Session(id: "3", type: "LESSON", challenges: challenges),
        Session(id: "4", type: "LESSON", challenges: challenges),
        Session(id: "5", type: "LESSON", challenges: challenges),
    ]
    let levels = [
        Level(id: "1", name: "My level", sessions: sessions),
        Level(id: "2", name: "My level", sessions: sessions),
        Level(id: "3", name: "My level", sessions: sessions),
        Level(id: "4", name: "My level", sessions: sessions),
        Level(id: "5", name: "My level", sessions: sessions),
        Level(id: "6", name: "My level", sessions: sessions),
        Level(id: "7", name: "My level", sessions: sessions),
    ]
    let units = [
        Unit(id: 1, name: "My unit", levels: levels),
        Unit(id: 2, name: "My unit", levels: levels),
        Unit(id: 3, name: "My unit", levels: levels),
        Unit(id: 4, name: "My unit", levels: levels),
        Unit(id: 5, name: "My unit", levels: levels),
        Unit(id: 6, name: "My unit", levels: levels)
    ]
    let sections = [
        Section(id: 1, name: "FIrst section", units: units),
        Section(id: 2, name: "FIrst section", units: units),
        Section(id: 3, name: "FIrst section", units: units),
        Section(id: 4, name: "FIrst section", units: units),
        Section(id: 5, name: "FIrst section", units: units),
        Section(id: 6, name: "FIrst section", units: units),
        Section(id: 7, name: "FIrst section", units: units),
    ]
    let courses = [
        Course(id: "1", fromLanguage: "pt", learningLanguage: "en", sections:sections),
        Course(id: "2", fromLanguage: "pt", learningLanguage: "es", sections:sections),
        Course(id: "3", fromLanguage: "pt", learningLanguage: "es", sections:sections),
        Course(id: "4", fromLanguage: "pt", learningLanguage: "es", sections:sections)
    ]
    
    return ContentView(courses: courses) {_,_,_,_,_ in
        print("called it")
    }
//    return SectionView(course: courses[0], section: sections[0]) {_,_,_,_,_ in
//        print("called it")
//    }
}
