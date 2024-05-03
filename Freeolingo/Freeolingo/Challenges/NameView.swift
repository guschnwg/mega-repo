//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct NameView: View {
    var name: Challenge.Name
    let languageSettings: LanguageSettings
    
    var body: some View {
        TextWithTTSView(label: "Prompt: \(name.prompt)", speak: name.prompt, language: languageSettings.fromLanguage)

        List(name.correctSolutions, id: \.self) { solution in
            TextWithTTSView(label: solution, speak: solution, language: languageSettings.learningLanguage)
        }
    }
}

#Preview {
    NameView(
        name: Challenge.Name(
            prompt: "a altura",
            correctSolutions: ["la hauteur"]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        )
    )
}
