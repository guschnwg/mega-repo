//
//  AllQuestionsView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation
import SwiftUI

struct AllChallengesView: View {
    var body: some View {
        List {
            ForEach(0...CHALLENGES.count-1, id: \.self) { index in
                let challenge = CHALLENGES[index]

                NavigationLink(
                    destination: ChallengeView(
                        languageSettings: LanguageSettings(
                            fromLanguage: "pt",
                            learningLanguage: "es"
                        ),
                        challenge: challenge,
                        onAnswered: {_ in },
                        onComplete: {_ in }
                    )
                ) {
                    Text(challenge.type)
                }
            }
        }
    }
}

#Preview {
    AllChallengesView()
}
