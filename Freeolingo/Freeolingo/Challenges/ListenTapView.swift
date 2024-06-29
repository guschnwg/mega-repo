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
            ButtonWithTTSView(
                speak: listenTap.prompt,
                language: languageSettings.learningLanguage
            ) {
                Label("", systemImage: "speaker.wave.2")
                    .font(.system(size: 48))
            }
            .frame(width: CGFloat(80))

            Spacer()

            WrappingHStack(alignment: .center) {
                ForEach(choiceChosen.indices, id: \.self) { index in
                    let choiceIndex = choiceChosen[index]
                    let choice = listenTap.choices[choiceIndex]

                    ButtonWithTTSView(
                        speak: choice.text,
                        language: languageSettings.fromLanguage,
                        isActive: true,
                        onTapGesture: { choiceChosen.removeAll(where: { $0 == choiceIndex }) }
                    ) {
                        Text(choice.text)
                    }
                    .frame(width: CGFloat(choice.text.count * 12 + 55))
                }
            }.padding(.all, 10)
            
            Spacer()
            
            WrappingHStack(alignment: .center) {
                ForEach(shuffled, id: \.self) { choice in
                    let index = listenTap.choices.firstIndex(of: choice)
                    let alreadyMatched = choiceChosen.contains(where: { $0 == index })

                    ButtonWithTTSView(
                        speak: choice.text,
                        language: languageSettings.fromLanguage,
                        isActive: false,
                        background: alreadyMatched ? .white.opacity(0.5) : .white,
                        onTapGesture: {
                            if alreadyMatched { return }
                            choiceChosen.append(index!)
                        }
                    ) {
                        Text(choice.text)
                            .foregroundStyle(alreadyMatched ? .black.opacity(0.5) : .black)
                    }
                    .frame(width: CGFloat(choice.text.count * 12 + 55))
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
            .disabled(choiceChosen.isEmpty)
        }
        .padding(.vertical, 100)
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
    .environmentObject(Speaker())
    .background(.red.lighter(by: 0.3))
}
