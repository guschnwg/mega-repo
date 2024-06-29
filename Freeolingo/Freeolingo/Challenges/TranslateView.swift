//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI
import WrappingHStack

struct TranslateView: View {
    var translate: Challenge.Translate
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: [Int] = []
    @State private var shuffled: [Challenge.Choice] = []
    
    var body: some View {
        VStack {
            TextWithTTSView(
                label: translate.prompt,
                speak: translate.prompt,
                language: languageSettings.fromLanguage
            )
            .font(.system(size: 36))
            
            Spacer()
            
            WrappingHStack(alignment: .center) {
                ForEach(choiceChosen.indices, id: \.self) { index in
                    let choiceIndex = choiceChosen[index]
                    let choice = translate.choices[choiceIndex]

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
                    let index = translate.choices.firstIndex(of: choice)
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
            
            Spacer()
            
            Button("Confirm") {
                onComplete(
                    translate.correctIndices == choiceChosen,
                    Text(translate.correctSolutions[0])
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen.isEmpty)
        }
        .padding(.vertical, 100)
        .onChange(of: translate) {
            choiceChosen = []
            shuffled = translate.choices.shuffled()
        }
        .onAppear {
            choiceChosen = []
            shuffled = translate.choices.shuffled()
        }
    }
}

#Preview {
    TranslateView(
        translate: Challenge.Translate(
            prompt: "Le chat noir",
            correctSolutions: ["O gato preto"],
            choices: [
                Challenge.Choice(text: "O"),
                Challenge.Choice(text: "gato"),
                Challenge.Choice(text: "preto"),
                Challenge.Choice(text: "subiu"),
                Challenge.Choice(text: "trabalhos"),
                Challenge.Choice(text: "pequena"),
                Challenge.Choice(text: "flor"),
            ],
            correctIndices: [0, 1, 2]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .environmentObject(Speaker())
    .background(.blue.lighter(by: 0.3))
}
