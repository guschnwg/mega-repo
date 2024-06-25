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
    let onComplete: (Bool, Text) -> Void

    @State private var current = ""
    @FocusState private var focused: Bool
    
    var body: some View {
        VStack(alignment: .center, spacing: 60) {
            TextWithTTSView(
                speak: listen.prompt,
                language: languageSettings.learningLanguage
            )
                .font(.largeTitle)
                .multilineTextAlignment(.center)

            TextField("...", text: $current)
                .padding(.all, 20)
                .background(.white)
                .clipShape(RoundedRectangle(cornerRadius: 25.0))
                .focused($focused)
                .font(.largeTitle)
            
            Button("Confirm") {
                focused = false
                
                let score = listen.solutionTranslation.distance(between: current)
                
                if score > 0.9 {
                    onComplete(true, Text("OK"))
                } else {
                    onComplete(false, Text("Not ok: (\(score)) \(listen.solutionTranslation)"))
                }
            }.disabled(current.isEmpty)
        }
        .padding(.vertical, 100)
        .padding(.horizontal, 50)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .onChange(of: listen) {
            current = ""
        }
        .onAppear {
            current = ""
        }
    }
}

#Preview {
    ListenView(
        listen: Challenge.Listen(
            prompt: "Hi, somethign something somthign",
            solutionTranslation: "Oi, tudo bem"
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR",
            learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    ).background(.red.lighter(by: 0.5))
}
