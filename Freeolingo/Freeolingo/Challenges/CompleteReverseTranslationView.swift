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
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 60) {
            TextWithTTSView(
                speak: completeReverseTranslation.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            Spacer()
            
            WrappingHStack(horizontalSpacing: 0) {
                ForEach(completeReverseTranslation.displayTokens, id: \.text) { token in
                    if token.isBlank {
                        let isFirst = completeReverseTranslation.displayTokens.firstIndex(of: token) == 0
                        TextField("...", text: $current)
                            .padding(.all, 5)
                            .background(.white)
                            .font(.largeTitle)
                            .frame(width: CGFloat(token.text.count) * 25)
                            .focused($focused)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .padding(.all, 5)
                            .textInputAutocapitalization(isFirst ? .sentences : .never)
                            .autocorrectionDisabled()
                    } else {
                        Text(token.text)
                            .font(.system(size: 22))
                            .padding(.all, 0)
                    }
                }
            }
            
            Spacer()
            
            ConfirmButtonView() {
                let solutions: [String] = completeReverseTranslation.displayTokens
                    .filter { $0.isBlank }
                    .map { $0.text }
                
                focused = false
                
                if solutions[0].distance(between: current) > 0.9 {
                    onComplete(true, Text("OK"))
                } else {
                    onComplete(false, Text("Not ok: \(solutions[0])"))
                }
            }
            .disabled(current.isEmpty)
        }
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .onChange(of: completeReverseTranslation) {
            current = ""
        }
        .onAppear {
            current = ""
            focused = true
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
            fromLanguage: "en_US", learningLanguage: "pt_BR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .environmentObject(Speaker())
    .environmentObject(ColorWrapper(.red))
    .background(.red.lighter(by: 0.3))
}
