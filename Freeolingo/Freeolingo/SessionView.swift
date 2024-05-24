//
//  SessionView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

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
        }
        .padding(.all, 10)
        .background(.green)
        .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
        .sheet(isPresented: $isPresented) {
            SessionChallengesView(
                course: course,
                section: section,
                unit: unit,
                level: level,
                session: session,
                finishSession: {
                    isPresented = false
                    finishSession()
                }
            )
        }
    }
}

#Preview {
    SessionView(
        course: COURSES[0],
        section: COURSES[0].sections[0],
        unit: COURSES[0].sections[0].units[0],
        level: COURSES[0].sections[0].units[0].levels[0],
        session: COURSES[0].sections[0].units[0].levels[0].sessions[0]
    ) {}
}
