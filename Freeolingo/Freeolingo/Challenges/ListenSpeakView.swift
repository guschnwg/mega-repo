//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct ListenSpeakView: View {
    var listenSpeak: Challenge.ListenSpeak
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: [Int] = []
    @State private var shuffled: [String] = []
    
    var body: some View {
        VStack {
            TextWithTTSView(
                label: listenSpeak.prompt,
                speak: listenSpeak.prompt,
                language: languageSettings.fromLanguage
            )
            .font(.system(size: 36))

            Spacer()

            WrappingHStack(alignment: .center) {
                ForEach(choiceChosen, id: \.self) { index in
                    let choice = listenSpeak.choices[index]
                    
                    ButtonWithTTSView(
                        speak: choice,
                        language: languageSettings.fromLanguage,
                        isActive: true,
                        onTapGesture: { choiceChosen.removeAll(where: { $0 == index }) }
                    ) {
                        Text(choice)
                    }
                    .frame(width: CGFloat(choice.count * 12 + 15 + 40))
                }
            }.padding(.all, 10)
            
            Spacer()
            
            WrappingHStack(alignment: .center) {
                let availableChoices = shuffled.filter({ choice in
                    let index = listenSpeak.choices.firstIndex(of: choice) ?? -1
                    return index == -1 || !choiceChosen.contains(index)
                })
                ForEach(shuffled, id: \.self) { choice in
                    let index = listenSpeak.choices.firstIndex(of: choice)
                    let alreadyMatched = choiceChosen.contains(where: { $0 == index })

                    ButtonWithTTSView(
                        speak: choice,
                        language: languageSettings.fromLanguage,
                        isActive: false,
                        background: {
                            if alreadyMatched {
                                return .white.opacity(0.5)
                            } else {
                                return .white
                            }
                        }(),
                        onTapGesture: {
                            if alreadyMatched { return }
                            choiceChosen.append(index!)
                        }
                    ) {
                        Text(choice)
                            .foregroundStyle(alreadyMatched ? .black.opacity(0.5) : .black)
                    }
                    .frame(width: CGFloat(choice.count * 12 + 15 + 40))
                }
            }.padding(.all, 10)
            
            Button("Confirm") {
                onComplete(
                    listenSpeak.correctIndices == choiceChosen,
                    Text("???")
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen.isEmpty)
        }
        .padding(.vertical, 100)
        .onChange(of: listenSpeak) {
            choiceChosen = []
            shuffled = listenSpeak.choices.shuffled()
        }
        .onAppear {
            choiceChosen = []
            shuffled = listenSpeak.choices.shuffled()
        }
    }
}

#Preview {
    ListenSpeakView(
        listenSpeak: Challenge.ListenSpeak(
            prompt: "Hi, bye",
            solutionTranslation: "Oi, tchau",
            choices: ["Oi", "Tchau", "Não", "Sim", "Tchauziho", "Entshuldingug"],
            correctIndices: [0, 1]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
    .environmentObject(Speaker())
    .background(.red.lighter(by: 0.3))
}
