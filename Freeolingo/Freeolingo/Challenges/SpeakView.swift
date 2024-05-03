//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct SpeakView: View {
    var speak: Challenge.Speak
    let languageSettings: LanguageSettings
    
    var body: some View {
        TextWithTTSView(label: "Prompt: \(speak.prompt)", speak: speak.prompt, language: languageSettings.learningLanguage)
        TextWithTTSView(label: "Solution: \(speak.solutionTranslation)", speak: speak.solutionTranslation, language: languageSettings.fromLanguage)

        RecognizeSpeechView(language: languageSettings.learningLanguage)
    }
}

#Preview {
    SpeakView(
        speak: Challenge.Speak(
            prompt: "la hauteur",
            solutionTranslation: "a altura"
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
