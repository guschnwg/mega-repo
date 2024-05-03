//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct PartialReverseTranslateView: View {
    var partialReverseTranslate: Challenge.PartialReverseTranslate
    let languageSettings: LanguageSettings
    
    var body: some View {
        TextWithTTSView(
            label: "Prompt: \(partialReverseTranslate.prompt)",
            speak: partialReverseTranslate.prompt,
            language: languageSettings.fromLanguage
        )

        var solution: String = ""
        let toComplete = partialReverseTranslate.displayTokens.map { token in
            let text = token.text
            if token.isBlank {
                solution.append(text)
                return text.map { _ in "_" }.joined()
            } else {
                return text
            }
        }.joined()
        TextWithTTSView(label: "Prompt: \(toComplete)", speak: toComplete, language: languageSettings.learningLanguage)

        TextWithTTSView(label: "Solution: \(solution)", speak: solution, language: languageSettings.learningLanguage)
    }
}

#Preview {
    PartialReverseTranslateView(
        partialReverseTranslate: Challenge.PartialReverseTranslate(
            prompt: "Eu achei o meu cachorro.",
            displayTokens: [
                Challenge.DisplayToken(text: "J", isBlank: true),
                Challenge.DisplayToken(text: "ai", isBlank: true),
                Challenge.DisplayToken(text: " ", isBlank: true),
                Challenge.DisplayToken(text: "retrouvé", isBlank: true),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "mon", isBlank: false),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "chien", isBlank: false),
                Challenge.DisplayToken(text: ".", isBlank: false),
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
