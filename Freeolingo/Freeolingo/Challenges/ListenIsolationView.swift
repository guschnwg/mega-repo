//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenIsolationView: View {
    var listenIsolation: Challenge.ListenIsolation
    let languageSettings: LanguageSettings
    
    var body: some View {
        let rangeStart = listenIsolation.blankRangeStart
        let rangeEnd = listenIsolation.blankRangeEnd
        let range = rangeStart...rangeEnd

        let tokens = listenIsolation.tokens
        let rawPrompt = tokens.map { $0.value }.joined()
        let prompt = tokens.enumerated().map {(index, item) in
            let word = item.value
            return range.contains(index) ? word.map { _ in "_" }.joined() : word
        }.joined()

        TextWithTTSView(label: "Prompt: \(prompt)", speak: rawPrompt, language: languageSettings.learningLanguage)

        let solutionTranslation = listenIsolation.solutionTranslation
        TextWithTTSView(
            label: "Solution: \(solutionTranslation)",
            speak: solutionTranslation,
            language: languageSettings.fromLanguage
        )

        let options = (listenIsolation.options).map { $0.text }
        let response = options[listenIsolation.correctIndex]

        List(options, id: \.self) { option in
            TextWithTTSView(
                label: option == response ? "\(option) ✅" : option,
                speak: option,
                language: languageSettings.learningLanguage
            )
        }
    }
}

#Preview {
    ListenIsolationView(
        listenIsolation: Challenge.ListenIsolation(
            blankRangeStart: 2,
            blankRangeEnd: 3,
            tokens: [
                Challenge.Token(value: "Il"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "mange"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "un"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "serpent"),
                Challenge.Token(value: "."),
            ],
            solutionTranslation: "Ele come uma cobra.",
            options: [
                Challenge.Option(text: "mangeons"),
                Challenge.Option(text: "mange"),
            ],
            correctIndex: 1
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
