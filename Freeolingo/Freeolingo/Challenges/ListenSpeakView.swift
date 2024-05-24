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
                    
                    TextWithTTSView(
                        label: choice,
                        speak: choice,
                        language: languageSettings.fromLanguage,
                        onTapGesture: { choiceChosen.remove(at: index) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { choiceChosen.remove(at: index) }
                }
            }.padding(.all, 10)
            
            Spacer()
            
            WrappingHStack(alignment: .center) {
                let availableChoices = shuffled.filter({ choice in
                    let index = listenSpeak.choices.firstIndex(of: choice) ?? -1
                    return index == -1 || !choiceChosen.contains(index)
                })
                ForEach(availableChoices, id: \.self) { choice in
                    let index = listenSpeak.choices.firstIndex(of: choice)

                    TextWithTTSView(
                        label: choice,
                        speak: choice,
                        language: languageSettings.fromLanguage,
                        onTapGesture: { choiceChosen.append(index!) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { choiceChosen.append(index!) }
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
        .background(.green)
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
            choices: ["Oi", "Tchau", "Não", "Sim"],
            correctIndices: [0, 1]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect, text in print("Is correct: \(isCorrect) \(text)")}
    )
}
