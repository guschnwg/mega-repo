//
//  LevelView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct CircularProgressView: View {
    let progress: Double
    let color: Color
    
    var body: some View {
        let fixedProgress = progress == 0 ? 0.001 : progress
        
        ZStack {
            Circle()
                .stroke(color.opacity(0.5), lineWidth: 10)
            Circle()
                .trim(from: 0, to: fixedProgress)
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: 10, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeOut, value: fixedProgress)

        }
    }
}

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
                sessionIndex: currentSession
            )
        }, label: {
            Text(level.name)
                .frame(width: 100, height: 100)
                .foregroundColor(.white)
        })
        .popover(isPresented: $isPresented) {
            VStack(alignment: .center, spacing: 30) {
                if level.type == LevelType.chest {
                    Text("Just keep going")

                    Button("Continue") {
                        finishSession()
                    }
                } else {
                    Text(level.name)

                    ZStack {
                        CircularProgressView(
                            progress: Double(currentSession) / Double(level.totalSessions),
                            color: color
                        )
                        Text("\(currentSession)/\(level.totalSessions)")
                            .foregroundStyle(color)
                    }.frame(width: 75, height: 75)
                    
                    let key = store.keyFor(
                        course: course,
                        section: section,
                        unit: unit,
                        level: level,
                        sessionIndex: currentSession
                    )
                    
                    if store.sessionsMap.keys.contains(key) {
                        HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
                            SessionView(
                                course: course,
                                section: section,
                                unit: unit,
                                level: level,
                                session: store.sessionsMap[key]!,
                                color: color,
                                finishSession: finishSession
                            )
                        }
                    } else {
                        Button("Start") {}
                        .padding()
                        .background(color.opacity(0.5))
                        .foregroundColor(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .disabled(true)
                    }
                }
            }
            .frame(minWidth: 150)
            .padding(.all, 20)
            .presentationCompactAdaptation((.popover))
        }
        .onChange(of: currentSession) {
            store.viewSession(
                course: course,
                section: section,
                unit: unit,
                level: level,
                sessionIndex: currentSession
            )
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
    .environmentObject(previewStore())
}
