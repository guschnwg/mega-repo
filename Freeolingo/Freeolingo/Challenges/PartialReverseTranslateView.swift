//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct PartialReverseTranslateView: View {
    var partialReverseTranslate: Challenge.PartialReverseTranslate
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var current = ""
    @FocusState private var focused: Bool
    
    @State private var tokens: [Challenge.DisplayToken] = []
    
    func initTokens(displayTokens: [Challenge.DisplayToken]) -> [Challenge.DisplayToken] {
        var tokens: [Challenge.DisplayToken] = []
        
        for token in displayTokens {
            let last = tokens.last
            if tokens.isEmpty || last?.isBlank != token.isBlank {
                tokens.append(Challenge.DisplayToken(text: token.text, isBlank: token.isBlank))
            } else {
                if last!.isBlank == token.isBlank {
                    let newLast = Challenge.DisplayToken(
                        text: last!.text + token.text,
                        isBlank: last!.isBlank
                    )
                    tokens[tokens.lastIndex(of: last!)!] = newLast
                }
            }
        }
        return tokens
    }
    
    var body: some View {
        VStack(spacing: 60) {
            TextWithTTSView(
                speak: partialReverseTranslate.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            WrappingHStack(horizontalSpacing: 0) {
                ForEach(tokens, id: \.text) { token in
                    if token.isBlank {
                        TextField("...", text: $current)
                            .padding(.all, 10)
                            .background(.white)
                            .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
                            .frame(width: CGFloat(token.text.count) * 15)
                            .focused($focused)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                            .font(.system(size: 22))
                    } else {
                        Text(token.text)
                            .padding(.all, 0)
                            .font(.system(size: 22))
                    }
                }
            }
            
            Button("Confirm") {
                focused = false

                let solution = tokens.first(where: { $0.isBlank })
                let score = solution!.text.distance(between: current)
                let fullSolution = partialReverseTranslate.displayTokens.map { $0.text }.joined()
                if score > 0.85 {
                    onComplete(true, Text("OK: \(fullSolution) \(score)"))
                } else {
                    onComplete(false, Text("NOT OK: \(fullSolution) \(score)"))
                }
            }.disabled(current.isEmpty)
        }
        .padding(.vertical, 100)
        .padding(.horizontal, 30)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .onChange(of: partialReverseTranslate) {
            current = ""
            tokens = initTokens(displayTokens: partialReverseTranslate.displayTokens)
        }
        .onAppear {
            current = ""
            focused = true
            tokens = initTokens(displayTokens: partialReverseTranslate.displayTokens)
        }
    }
}

#Preview {
    PartialReverseTranslateView(
        partialReverseTranslate: Challenge.PartialReverseTranslate(
            prompt: "Eu achei o meu cachorro.",
            displayTokens: [
                Challenge.DisplayToken(text: "J", isBlank: true),
                Challenge.DisplayToken(text: "ai", isBlank: true),
                Challenge.DisplayToken(text: " ", isBlank: true),
                Challenge.DisplayToken(text: "retrouvé", isBlank: true),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "mon", isBlank: false),
                Challenge.DisplayToken(text: " ", isBlank: false),
                Challenge.DisplayToken(text: "chien", isBlank: false),
                Challenge.DisplayToken(text: ".", isBlank: false),
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
    .environmentObject(Speaker())
    .background(.red.lighter())
}
