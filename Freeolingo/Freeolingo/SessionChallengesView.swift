//
//  SessionChallengesView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct Style: ProgressViewStyle {
    let color: Color
    let current: Int
    let full: Int

    func makeBody(configuration: Configuration) -> some View {
        ZStack(alignment: .leading) {
            GeometryReader {reader in
                let width = reader.size.width

                RoundedRectangle(cornerRadius: 10)
                    .frame(width: width, height: 36)
                    .foregroundColor(.white.opacity(0.6))
                
                ZStack {
                    let width = configuration.fractionCompleted! * width
                    RoundedRectangle(cornerRadius: 10)
                        .frame(
                            width: width,
                            height: 36
                        )
                        .foregroundColor(color)
                    
                    Text("\(current)/\(full)")
                        .foregroundStyle(.white)
                        .fontWeight(.bold)
                        .font(.system(size: 20))
                        .padding(.horizontal, 10)
                }
            }
        }
    }
}

struct SessionChallengesView: View {
    let course: Course
    let section: Section
    let unit: Unit
    let level: Level
    let session: Session
    
    let finishSession: () -> Void
    
    @EnvironmentObject var colorWrapper: ColorWrapper
    
    @State private var currentChallenge = 0
    @State private var increment = 0
    
    func onComplete(isCorrect: Bool) {
        if isCorrect {
            if session.challenges.indices.contains(currentChallenge + 1) {
                currentChallenge += 1
            } else {
                finishSession()
                currentChallenge = 0
            }
            increment = 0
        } else {
            // Add the same challenge in the end so we can retry?
        }
    }
    
    var body: some View {
        VStack(spacing: 30) {
            HStack {
                let current = currentChallenge + increment
                let count = session.challenges.count
                let progress = CGFloat(current + 4) / CGFloat(count + 5)

                ProgressView(value: progress)
                    .animation(.easeInOut(duration: 0.1), value: increment)
                    .progressViewStyle(
                        Style(
                            color: colorWrapper.color,
                            current: current,
                            full: count
                        )
                    )
                    .onTapGesture {
                        onComplete(isCorrect: true)
                    }
            }
            .frame(height: 36)
            .padding(.horizontal, 10)
            
            ChallengeView(
                languageSettings: LanguageSettings(
                    fromLanguage: course.fromLanguage,
                    learningLanguage: course.learningLanguage
                ),
                challenge: session.challenges[currentChallenge],
                onAnswered: {isCorrect in
                    if isCorrect {
                        increment = 1
                    }
                },
                onComplete: onComplete
            )
        }
        .padding(.all, 20)
        .background(colorWrapper.color.lighter(by: 0.5))
    }
}

#Preview {
    @State var something = true
    return Button("HI") {}
        .sheet(isPresented: $something) {
            SessionChallengesView(
                course: COURSES[0],
                section: COURSES[0].sections[0],
                unit: COURSES[0].sections[0].units[0],
                level: COURSES[0].sections[0].units[0].levels[0],
                session: SESSIONS[0]
            ) {}
        }
        .environmentObject(Speaker())
        .environmentObject(ColorWrapper(.red))
    
}
