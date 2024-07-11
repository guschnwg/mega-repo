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
    
    let finishAction: () -> Void
    
    @EnvironmentObject var colorWrapper: ColorWrapper
    
    @State private var isPresented = false
    
    var body: some View {
        HStack(spacing: 0) {
            Button(action: { isPresented = true }) {
                Text("Start").frame(maxWidth: .infinity)
            }
            .padding()
            .background(colorWrapper.color)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .sheet(isPresented: $isPresented) {
                SessionChallengesView(
                    course: course,
                    section: section,
                    unit: unit,
                    level: level,
                    session: session
                ) {
                    isPresented = false
                    finishAction()
                }
            }

//            Button(action: {
//                finishAction()
//            }) {
//                Image(systemName: "figure.jumprope")
//                    .frame(width: 30)
//                    .frame(height: 20)
//            }
//            .padding()
//            .background(colorWrapper.color)
//            .foregroundColor(.white)
//            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }
}

#Preview {
    SessionView(
        course: COURSES[0],
        section: COURSES[0].sections[0],
        unit: COURSES[0].sections[0].units[0],
        level: COURSES[0].sections[0].units[0].levels[0],
        session: SESSIONS[0]
    ) {}
        .environmentObject(ColorWrapper(.red))
}
