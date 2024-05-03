//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack
import StringMetric

struct CompleteReverseTranslationView: View {
    var completeReverseTranslation: Challenge.CompleteReverseTranslation
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var current = ""
    
    var body: some View {
        VStack(spacing: 60) {
            TextWithTTSView(
                speak: completeReverseTranslation.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            WrappingHStack(horizontalSpacing: 0) {
                ForEach(completeReverseTranslation.displayTokens, id: \.text) { token in
                    if token.isBlank {
                        TextField("...", text: $current)
                            .background(.white)
                            .frame(width: CGFloat(token.text.count) * 50)
                            .padding(.all, 0)
                    } else {
                        Text(token.text)
                        .padding(.all, 0)
                    }
                }
            }
            
            Button("Confirm") {
                let solutions: [String] = completeReverseTranslation.displayTokens
                    .filter { $0.isBlank }
                    .map { $0.text }
                
                if solutions[0].distance(between: current) > 0.9 {
                    onComplete(true, Text("OK"))
                } else {
                    onComplete(false, Text("Not ok: \(solutions[0])"))
                }
            }.disabled(current.isEmpty)
        }
        .padding(.vertical, 100)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .background(.green)
        .onChange(of: completeReverseTranslation) {
            current = ""
        }
        .onAppear {
            current = ""
        }
    }
}

#Preview {
    CompleteReverseTranslationView(
        completeReverseTranslation: Challenge.CompleteReverseTranslation(
            prompt: "Hi, bye",
            displayTokens: [
                Challenge.DisplayToken(text: "Oi", isBlank: true),
                Challenge.DisplayToken(text: ",", isBlank: false),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "tchau", isBlank: false)
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
