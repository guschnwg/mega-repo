//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct ListenIsolationView: View {
    var listenIsolation: Challenge.ListenIsolation
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: Int = -1
    @State private var shuffled: [Challenge.Option] = []
    
    var body: some View {
        VStack {
            let rangeStart = listenIsolation.blankRangeStart
            let rangeEnd = listenIsolation.blankRangeEnd
            let range = rangeStart...rangeEnd-1

            WrappingHStack(alignment: .center, horizontalSpacing: 0) {
                let fullSentence = listenIsolation.tokens
                    .map {token in token.value }
                    .joined()

                ForEach(listenIsolation.tokens.indices, id:\.self) {index in
                    let token = listenIsolation.tokens[index]
                    if range.contains(index) {
                        if choiceChosen == -1 {
                            Text(token.value.map({ _ in "_" }).joined())
                        } else {
                            let option = listenIsolation.options[choiceChosen]
                            Text(option.text)
                                .padding(.all, 10)
                                .background(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .onTapGesture { choiceChosen = -1 }
                        }
                    } else {
                        TextWithTTSView(
                            label: token.value,
                            speak: fullSentence,
                            language: languageSettings.learningLanguage
                        )
                    }
                }
            }
            
            WrappingHStack(alignment: .center) {
                let availableOptions = shuffled.filter({ option in
                    let index = listenIsolation.options.firstIndex(of: option) ?? -1
                    return index == -1 || choiceChosen != index
                })

                ForEach(shuffled, id: \.self) { option in
                    let index = listenIsolation.options.firstIndex(of: option)
                    
                    ButtonWithTTSView(
                        speak: option.text,
                        language: languageSettings.learningLanguage,
                        isActive: !availableOptions.contains(option),
                        onTapGesture: { choiceChosen = index! }
                    ) {
                        Text(option.text)
                    }
                }
            }.padding(.all, 10)
            
            Button("Confirm") {
                onComplete(
                    listenIsolation.correctIndex == choiceChosen,
                    Text(listenIsolation.solutionTranslation)
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen == -1)
        }
        .padding(.vertical, 100)
        .frame(maxWidth: .infinity, maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
        .onChange(of: listenIsolation) {
            choiceChosen = -1
            shuffled = listenIsolation.options.shuffled()
        }
        .onAppear {
            choiceChosen = -1
            shuffled = listenIsolation.options.shuffled()
        }
    }
}

#Preview {
    ListenIsolationView(
        listenIsolation: Challenge.ListenIsolation(
            blankRangeStart: 2,
            blankRangeEnd: 3,
            tokens: [
                Challenge.Token(value: "Il"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "mange"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "un"),
                Challenge.Token(value: " "),
                Challenge.Token(value: "serpent"),
                Challenge.Token(value: "."),
            ],
            solutionTranslation: "Ele come uma cobra.",
            options: [
                Challenge.Option(text: "mangeons"),
                Challenge.Option(text: "mange"),
            ],
            correctIndex: 1
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
    .environmentObject(Speaker())
    .background(.red.lighter(by: 0.3))
}
