//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

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
                Image(systemName: "speaker.wave.2")
                    .resizable()
                    .frame(width: 32, height: 32)
            }.frame(width: 200)

            Spacer()
            
            WrappingHStack(horizontalSpacing: 0) {
                ForEach(listenComplete.displayTokens, id: \.text) { token in
                    if token.isBlank {
                        let isFirst = listenComplete.displayTokens.firstIndex(of: token) == 0
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
        .onChange(of: listenComplete) {
            current = ""
        }
        .onAppear {
            current = ""
            focused = true
        }
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
    .environmentObject(ColorWrapper(.red))
    .background(.red.lighter(by: 0.3))
}
