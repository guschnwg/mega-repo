//
//  FreeolingoApp.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 30/03/24.
//

import SwiftUI

@main
struct FreeolingoApp: App {
    @StateObject private var store = Store()
    @State var courses: Array<Course> = []
    
    var body: some Scene {
        WindowGroup {
            ContentView(courses: courses, sessionAttempts: $store.sessionAttempts) { course, section, unit, level, session in
                let newAttempt = SessionAttempt(
                    id: store.sessionAttempts.count,
                    courseId: course.id,
                    sectionId: section.id,
                    unitId: unit.id,
                    levelId: level.id,
                    sessionId: session.id,
                    viewed: true,
                    passed: false,
                    attemps: [SingleAttempt(started: Date.now, finished: nil, passed: false)]
                )
                store.sessionAttempts.append(newAttempt)
                store.save()
            }
            .onAppear {
                courses = listCourses()
                store.load()
            }
        }
    }
}
