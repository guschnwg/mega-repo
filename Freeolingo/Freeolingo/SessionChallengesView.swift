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
                    RoundedRectangle(cornerRadius: 10)
                        .frame(
                            width: configuration.fractionCompleted! * width,
                            height: 36
                        )
                        .foregroundColor(color)
                    
                    Text("\(current)/\(full)")
                        .foregroundStyle(.white)
                        .fontWeight(.bold)
                        .font(.system(size: 20))
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
    let color: Color
    
    let finishSession: () -> Void
    
    @State private var currentChallenge = 4
    @State private var increment = 0
    
    var body: some View {
        VStack(spacing: 30) {
            HStack {
                // +1 to have 1 in the progress bar
                let current = currentChallenge + increment + 1
                // +2 to have more space filled in the progress bar so the label shows
                let currentForProgress = current + 2
                let count = session.challenges.count + 3
                let progress = CGFloat(currentForProgress) / CGFloat(count)

                ProgressView(value: progress)
                    .animation(.easeInOut(duration: 0.1), value: increment)
                    .progressViewStyle(
                        Style(
                            color: color,
                            current: current,
                            full: count
                        )
                    )
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
                onComplete: {isCorrect in
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
            )
        }
        .padding(.vertical, 20)
        .background(color.lighter(by: 0.5))
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
                session: SESSIONS[0],
                color: .red
            ) {}
        }
        .environmentObject(Speaker())
    
}
