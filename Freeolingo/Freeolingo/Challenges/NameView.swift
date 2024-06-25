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
    let onComplete: (Bool, Text) -> Void

    @State private var current = ""
    @FocusState private var focused: Bool
    
    var body: some View {
        VStack(alignment: .center, spacing: 60) {
            TextWithTTSView(
                label: name.prompt,
                speak: name.prompt,
                language: languageSettings.fromLanguage
            )

            TextField("...", text: $current)
                .clipShape(RoundedRectangle(cornerRadius: 25.0))
                .padding(.vertical, 20)
                .background(.white)
                .focused($focused)
            
            Button("Confirm") {
                focused = false
                
                var maxScore = 0.0
                
                for solution in name.correctSolutions {
                    let score = solution.lowercased().distance(
                        between: current.lowercased()
                    )

                    if score > 0.85 {
                        onComplete(true, Text("OK \(score)"))
                        return
                    }

                    maxScore = score > maxScore ? score : maxScore
                }
                
                let firstSolution = name.correctSolutions.first ?? ""
                onComplete(false, Text("Not ok: \(firstSolution), \(maxScore)"))
            }.disabled(current.isEmpty)
        }
        .padding(.vertical, 100)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .background(.green)
        .onChange(of: name) {
            current = ""
        }
        .onAppear {
            current = ""
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
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
}
