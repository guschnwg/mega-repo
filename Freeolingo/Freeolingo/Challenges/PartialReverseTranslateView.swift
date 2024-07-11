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

    // current could be a map index -> String instead
    @State private var current: [String] = []
    @State private var blankIndexesMap: [Int: Int] = [:]
    
    var body: some View {
        VStack {
            TextWithTTSView(
                speak: partialReverseTranslate.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))

            Spacer()
            
            if !current.isEmpty && !blankIndexesMap.isEmpty {
                WrappingHStack(horizontalSpacing: 0.5) {
                    ForEach(partialReverseTranslate.displayTokens.indices, id: \.self) { index in
                        let token = partialReverseTranslate.displayTokens[index]
                        
                        if let inCurrentIndex = blankIndexesMap[index] {
                            if current.count > inCurrentIndex {
                                TextField("...", text: $current[inCurrentIndex])
                                    .padding(.all, 10)
                                    .background(.white)
                                    .frame(width:
                                            max(CGFloat(token.text.count) * 20, 50)
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .font(.system(size: 22))
                            }
                        } else {
                            Text(token.text)
                                .padding(.horizontal, 0)
                                .font(.system(size: 22))
                        }
                    }
                }
            } else {
                Text(":)")
            }

            Spacer()

            ConfirmButtonView {
                let solution = partialReverseTranslate.displayTokens.map { $0.text }.joined()
                let attempt = partialReverseTranslate.displayTokens.map{ token in
                    let index = partialReverseTranslate.displayTokens.firstIndex(of: token)
                    if let inCurrentIndex = blankIndexesMap[index!] {
                        return current[inCurrentIndex]
                    } else {
                        return token.text
                    }
                }.joined()
                
                let score = solution.distance(between: attempt)
                if score > 0.85 {
                    onComplete(true, Text("OK: \(solution) \(score)"))
                } else {
                    onComplete(false, Text("NOT OK: \(solution) \(score)"))
                }
            }
            .disabled(current.contains(""))
        }
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .onChange(of: partialReverseTranslate) {
            current = []
            for index in partialReverseTranslate.displayTokens.indices {
                let token = partialReverseTranslate.displayTokens[index]
                if token.isBlank && !token.text.isEmpty && token.text != " " {
                    blankIndexesMap[index] = current.count
                    current.append("")
                }
                
            }
        }
        .onAppear {
            current = []
            for index in partialReverseTranslate.displayTokens.indices {
                let token = partialReverseTranslate.displayTokens[index]
                if token.isBlank && !token.text.isEmpty && token.text != " " {
                    blankIndexesMap[index] = current.count
                    current.append("")
                }
                
            }
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
    .environmentObject(ColorWrapper(.red))
    .background(.red.lighter())
}
