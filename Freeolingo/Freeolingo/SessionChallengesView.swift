//
//  SessionChallengesView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct Style: ProgressViewStyle {
    func makeBody(configuration: Configuration) -> some View {
        ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 10)
                .frame(width: 250, height: 28)
                .foregroundColor(.gray.opacity(0.2))
            
            RoundedRectangle(cornerRadius: 10)
                .frame(width: CGFloat(configuration.fractionCompleted ?? 0) * 250, height: 28)
                .foregroundColor(.green)
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
    
    @State private var currentChallenge = 0
    @State private var increment = 0
    
    var body: some View {
        VStack {
            ProgressView(value: ((CGFloat(currentChallenge + increment + 1)) / CGFloat(session.challenges.count + 1)))
                .animation(.easeInOut(duration: 0.1), value: increment)
                .progressViewStyle(Style())
                .padding()
            
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
    }
}

#Preview {
    return SessionChallengesView(
        course: COURSES[0],
        section: COURSES[0].sections[0],
        unit: COURSES[0].sections[0].units[0],
        level: COURSES[0].sections[0].units[0].levels[0],
        session: SESSIONS[0]
    ) {}
}