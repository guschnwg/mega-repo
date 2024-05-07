//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenCompleteView: View {
    var listenComplete: Challenge.ListenComplete
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    var body: some View {
        var solutions: [String] = []

        let prompt = listenComplete.displayTokens.map { token in
            let text = token.text
            if token.isBlank {
                solutions.append(text)
                return text.map { _ in "_" }.joined()
            } else {
                return text
            }
        }.joined()

        TextWithTTSView(label: "Prompt: \(prompt)", speak: prompt, language: languageSettings.learningLanguage)

        TextWithTTSView(label: "Translation: \(listenComplete.solutionTranslation)", speak: listenComplete.solutionTranslation, language: languageSettings.fromLanguage)

        List(solutions, id: \.self) { token in
            TextWithTTSView(label: token, speak: token, language: languageSettings.learningLanguage)
        }    }
}

#Preview {
    ListenCompleteView(
        listenComplete: Challenge.ListenComplete(
            displayTokens: [
                Challenge.DisplayToken(text: "Hi", isBlank: true),
                Challenge.DisplayToken(text: ",", isBlank: false),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "bye", isBlank: false),
            ],
            solutionTranslation: "Oi, tchau"
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
