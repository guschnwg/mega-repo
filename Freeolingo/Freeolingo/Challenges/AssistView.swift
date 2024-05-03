//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct AssistView: View {
    let assist: Challenge.Assist
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var choiceChosen: Int = -1
    
    var body: some View {
        VStack {
            TextWithTTSView(
                label: assist.prompt,
                speak: assist.prompt,
                language: languageSettings.fromLanguage
            ).font(.system(size: 36))
            
            Spacer()
            
            ForEach(assist.choices.indices, id: \.self) { index in
                let choice = assist.choices[index]
                let choiceStr = index == choiceChosen ? "\(choice) ✅" : choice
                
                VStack {
                    TextWithTTSView(
                        label: choiceStr,
                        speak: choice,
                        language: languageSettings.learningLanguage,
                        onTapGesture: { self.choiceChosen = index }
                    )
                    .padding(.all, 20)
                    .frame(maxWidth: .infinity)
                    .background(.red)
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture {
                        self.choiceChosen = index
                    }
                }
                    
            }

            Spacer()

            Button("Confirm") {
                onComplete(
                    assist.correctIndex == choiceChosen,
                    Text(assist.choices[assist.correctIndex])
                )
            }
            .frame(maxWidth: .infinity)
            .padding(.all, 20)
            .disabled(choiceChosen == -1)
        }
        .padding(.all, 100)
        .background(.green)
        .onChange(of: assist) { choiceChosen = -1 }
    }
}

#Preview {
    AssistView(
        assist: Challenge.Assist(
            prompt: "Oi",
            choices: ["Hi", "Bye"],
            correctIndex: 0
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
