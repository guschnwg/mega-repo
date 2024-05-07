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
                label: "Prompt: \(listen.prompt)", speak: listen.prompt, language: languageSettings.learningLanguage
            )

            TextField("...", text: $current)
                .background(.white)
                .padding(.horizontal, 50)
                .textFieldStyle(PurpleBorder())
                .focused($focused)
            
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
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .background(.green)
        .onChange(of: listen) {
            
        }
        .onAppear {
            
        }
    }
}

struct PurpleBorder: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(.green)
            .overlay(
                RoundedRectangle(cornerRadius: 30)
                    .stroke(.purple, lineWidth:2)
            )
    }
}

#Preview {
    ListenView(
        listen: Challenge.Listen(prompt: "Hi, somethign something somthign", solutionTranslation: "Oi, tudo bem"),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
}
