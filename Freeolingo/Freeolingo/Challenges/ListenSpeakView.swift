//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenSpeakView: View {
    var listenSpeak: Challenge.ListenSpeak
    let languageSettings: LanguageSettings
    
    var body: some View {
        let prompt = listenSpeak.prompt
        TextWithTTSView(label: "Prompt: \(prompt)", speak: prompt, language: languageSettings.learningLanguage)

        List(listenSpeak.choices, id: \.self) { choice in
            let index = listenSpeak.choices.firstIndex(of: choice)
            let number = listenSpeak.correctIndices.firstIndex(of: index!)
            let emoji = number != nil ? emojiForNumber(number!) : "❌"
            let choiceStr = "\(choice) \(emoji)"

            TextWithTTSView(label: choiceStr, speak: choice, language: languageSettings.fromLanguage)
        }
    }
}

#Preview {
    ListenSpeakView(
        listenSpeak: Challenge.ListenSpeak(
            prompt: "Hi, bye",
            solutionTranslation: "Oi, tchau",
            choices: ["Oi", "Tchau", "Não", "Sim"],
            correctIndices: [0, 1]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
