//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct ListenTapView: View {
    var listenTap: Challenge.ListenTap
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: [Int] = []
    @State private var shuffled: [Challenge.Choice] = []
    
    var body: some View {
        VStack {
            TextListenView(
                speak: listenTap.prompt,
                language: languageSettings.learningLanguage
            )
            .font(.system(size: 48))
            
            Spacer()

            WrappingHStack(alignment: .center) {
                ForEach(choiceChosen.indices, id: \.self) { index in
                    let choiceIndex = choiceChosen[index]
                    let choice = listenTap.choices[choiceIndex]
                    
                    TextWithTTSView(
                        label: choice.text,
                        speak: choice.text,
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
                    let index = listenTap.choices.firstIndex(of: choice) ?? -1
                    return index == -1 || !choiceChosen.contains(index)
                })
                ForEach(availableChoices, id: \.self) { choice in
                    let index = listenTap.choices.firstIndex(of: choice)
                    
                    TextWithTTSView(
                        label: choice.text,
                        speak: choice.text,
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
                    listenTap.correctIndices == choiceChosen,
                    Text("\(listenTap.prompt) or \(listenTap.solutionTranslation)")
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen.count == 0)
        }
        .padding(.vertical, 100)
        .background(.green)
        .onChange(of: listenTap) {
            choiceChosen = []
            shuffled = listenTap.choices.shuffled()
        }
        .onAppear {
            choiceChosen = []
            shuffled = listenTap.choices.shuffled()
        }
    }
}

#Preview {
    ListenTapView(
        listenTap: Challenge.ListenTap(
            prompt: "Ta crêpe est ronde.",
            solutionTranslation: "Teu crepe é redondo.",
            choices: [
                Challenge.Choice(text: "Ta"),
                Challenge.Choice(text: "crêpe"),
                Challenge.Choice(text: "est"),
                Challenge.Choice(text: "ronde"),
                Challenge.Choice(text: "et"),
                Challenge.Choice(text: "jus"),
                Challenge.Choice(text: "vos"),
                Challenge.Choice(text: "fromage"),
            ],
            correctIndices: [0, 1, 2, 3]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
