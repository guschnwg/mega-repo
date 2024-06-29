//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenCompleteView: View {
    var listenComplete: Challenge.ListenComplete
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var current: String = ""
    @FocusState private var focused: Bool
    
    var body: some View {
        let prompt = listenComplete.displayTokens.map { token in token.text }.joined()
        let promptCensored = listenComplete.displayTokens.map { token in
            if token.isBlank {
                return token.text.map { _ in "_" }.joined()
            } else {
                return token.text
            }}.joined()
        
        let solutions = listenComplete.displayTokens
            .filter { $0.isBlank }
            .map { $0.text }
        
        VStack {
            ButtonWithTTSView(
                speak: prompt,
                language: languageSettings.learningLanguage
            ) {
                Label(promptCensored, systemImage: "speaker.wave.2")
            }
            
            // I don't know if there will be many items to fill in this...
            ForEach(solutions.indices, id: \.self) { index in
                let token = solutions[index]
                TextField("...", text: $current)
                    .background(.white)
                    .font(.largeTitle)
                    .frame(width: .infinity)
                    .padding(.all, 10)
                    .focused($focused)
            }
            .onChange(of: listenComplete) {
                current = ""
            }
            .onAppear {
                current = ""
                focused = true
            }
            
            Button("Confirm") {
                focused = false
                
                if solutions[0].distance(between: current) > 0.9 {
                    onComplete(true, Text("OK"))
                } else {
                    onComplete(false, Text("Not ok: \(solutions[0])"))
                }
            }.disabled(current.isEmpty)
        }
        .padding(.vertical, 100)
        .padding(.horizontal, 10)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
    }
}

#Preview {
    ListenCompleteView(
        listenComplete: Challenge.ListenComplete(
            displayTokens: [
                Challenge.DisplayToken(text: "Hi", isBlank: true),
                Challenge.DisplayToken(text: ",", isBlank: false),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "bye", isBlank: false),
            ],
            solutionTranslation: "Oi, tchau"
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "en_US"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .environmentObject(Speaker())
    .background(.red.lighter(by: 0.3))
}
