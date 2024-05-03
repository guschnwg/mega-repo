//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenView: View {
    var listen: Challenge.Listen
    let languageSettings: LanguageSettings
    
    var body: some View {
        TextWithTTSView(
            label: "Prompt: \(listen.prompt)", speak: listen.prompt, language: languageSettings.learningLanguage
        )
        TextWithTTSView(
            label: "Solution: \(listen.solutionTranslation)",
            speak: listen.solutionTranslation,
            language: languageSettings.fromLanguage
        )
    }
}

#Preview {
    ListenView(
        listen: Challenge.Listen(prompt: "Hi", solutionTranslation: "Oi"),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
