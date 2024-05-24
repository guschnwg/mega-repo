//
//  FreeolingoApp.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 30/03/24.
//

import SwiftUI

func getQuestionTypesMap(courses: Array<Course>) -> [String: Array<Challenge>] {
    var questionTypesMap: [String: Array<Challenge>] = [:]

    for course in courses {
        for section in course.sections {
            for unit in section.units {
                for level in unit.levels {
                    for session in level.sessions {
                        for challenge in session.challenges {
                            if var item = questionTypesMap[challenge.type] {
                                item.append(challenge)
                                questionTypesMap[challenge.type] = item
                            } else {
                                questionTypesMap[challenge.type] = [challenge]
                            }
                        }
                    }
                }
            }
        }
    }
    
    return questionTypesMap
}

@main
struct FreeolingoApp: App {
//    @StateObject private var store = Store()
    @State var courses: Array<Course> = []
    
    var body: some Scene {
        WindowGroup {
//            ContentView(
//                courses: courses
//            ) { course, section, unit, level, session in
//                let newAttempt = SessionAttempt(
//                    id: store.sessionAttempts.count,
//                    courseId: course.id,
//                    sectionId: section.id,
//                    unitId: unit.id,
//                    levelId: level.id,
//                    sessionId: session.id,
//                    viewed: true,
//                    passed: false,
//                    attemps: [SingleAttempt(started: Date.now, finished: nil, passed: false)]
//                )
//                store.sessionAttempts.append(newAttempt)
//                store.save()
//            }
//            .onAppear {
//                courses = listCourses()
//                store.load()
//            }
            ContentView(courses: COURSES) {_,_,_,_,_ in}
            
//            SectionView(
//                course: COURSES[0],
//                section: COURSES[0].sections[0]
//            ) {_,_,_,_,_ in}
        }
    }
}
