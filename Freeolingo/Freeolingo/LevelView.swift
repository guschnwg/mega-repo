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

struct LevelPopoverView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let currentSession: Int

    let finishAction: () -> Void

    @EnvironmentObject var colorWrapper: ColorWrapper
    @EnvironmentObject var api: Api
    
    var body: some View {
        VStack(alignment: .center, spacing: 30) {
            if level.type == LevelType.chest {
                Text("Just keep going")

                Button("Continue") {
                    finishAction()
                }
            } else {
                Text(level.name)

                ZStack {
                    CircularProgressView(
                        progress: Double(currentSession) / Double(level.totalSessions),
                        color: colorWrapper.color
                    )
                    Text("\(currentSession)/\(level.totalSessions)")
                        .foregroundStyle(colorWrapper.color)
                }.frame(width: 75, height: 75)
                
                let key = api.keyFor(
                    course: course,
                    section: section,
                    unit: unit,
                    level: level,
                    sessionIndex: currentSession
                )
                
                if api.sessionsMap.keys.contains(key) {
                    HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
                        SessionView(
                            course: course,
                            section: section,
                            unit: unit,
                            level: level,
                            session: api.sessionsMap[key]!,
                            finishAction: finishAction
                        )
                    }
                } else {
                    Button("Start") {}
                    .padding()
                    .background(colorWrapper.color.opacity(0.5))
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
}

struct LevelView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    
    let finishAction: () -> Void

    @EnvironmentObject var colorWrapper: ColorWrapper
    @EnvironmentObject var api: Api
    @EnvironmentObject var state: AppState
    
    @State private var isPresented = false
    @State private var currentSession = 0

    func finishSession() {
        Task {
            currentSession = await state.completeSession(
                course, section, unit, level, currentSession
            )
            if currentSession < level.totalSessions {
                api.getSession(
                    course: course,
                    section: section,
                    unit: unit,
                    level: level,
                    sessionIndex: currentSession
                )
            } else {
                isPresented = false
                await state.complete(course, section, unit, level)
                finishAction()
            }
        }
    }
    
    var body: some View {
        let isAvailable = state.isAvailable(
            course: course, section: section, unit: unit, level: level
        )

        Button(action: {
            currentSession = state.currentSession(course, section, unit, level)
            api.getSession(
                course: course,
                section: section,
                unit: unit,
                level: level,
                sessionIndex: currentSession
            )
            isPresented = true
        }, label: {
            ZStack(alignment: .center) {
                Text(level.name)
                    .foregroundColor(isAvailable ? .white : .white.opacity(0.5))
                
                if !isAvailable {
                    VStack {
                        Image(systemName: "lock")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 32, height: 32)
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, maxHeight: .infinity)
                    .background(.white.opacity(0.5))
                }
            }
            .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, maxHeight: .infinity)
            .background(colorWrapper.color)
            .clipShape(Circle())
        })
        .popover(isPresented: $isPresented) {
            LevelPopoverView(
                course: course,
                section: section,
                unit: unit,
                level: level,
                currentSession: currentSession,
                finishAction: finishSession
            )
        }
        .disabled(!isAvailable)
    }
}

#Preview {
    VStack {
        VStack {
            LevelView(
                course: COURSES[0],
                section: COURSES[0].sections[0],
                unit: COURSES[0].sections[0].units[0],
                level: COURSES[0].sections[0].units[0].levels[0],
                finishAction: {}
            )
            .environmentObject(previewApi())
            .environmentObject(previewState())
            .environmentObject(ColorWrapper(.blue))
        }.frame(width: 120, height: 120)
        
        VStack {
            LevelView(
                course: COURSES[0],
                section: COURSES[0].sections[1],
                unit: COURSES[0].sections[1].units[1],
                level: COURSES[0].sections[1].units[1].levels[1],
                finishAction: {}
            )
            .environmentObject(previewApi())
            .environmentObject(previewState())
            .environmentObject(ColorWrapper(.red))
        }.frame(width: 120, height: 120)
    }
}
