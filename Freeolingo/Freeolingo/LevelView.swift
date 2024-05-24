//
//  LevelView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct LevelView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let color: Color
    
    @EnvironmentObject var store: Store
    
    @State private var isPresented = false
    @State private var currentSession = 0
    
    func finishSession() -> Void {
        if currentSession + 1 < level.totalSessions {
            currentSession += 1
        } else {
            isPresented = false
        }
    }
    
    var body: some View {
        Button(action: {
            isPresented = true
            store.viewSession(
                course: course,
                section: section,
                unit: unit,
                level: level,
                session: SESSIONS[currentSession]
            )
        }, label: {
            Text(level.name).frame(width: 100, height: 100)
        })
        .popover(isPresented: $isPresented) {
            VStack(alignment: .leading, spacing: 30) {
                Text(level.name)
                
                Text(
                    "Lesson \(currentSession + 1) from \(level.totalSessions)"
                )
                
                HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
                    SessionView(
                        course: course,
                        section: section,
                        unit: unit,
                        level: level,
                        session: SESSIONS[currentSession],
                        finishSession: finishSession
                    )
                }
            }
            .padding(.all, 20)
            .presentationCompactAdaptation((.popover))
            
        }
    }
}

#Preview {
    LevelView(
        course: COURSES[0],
        section: COURSES[0].sections[0],
        unit: COURSES[0].sections[0].units[0],
        level: COURSES[0].sections[0].units[0].levels[0],
        color: .red
    ).background(.red)
}
