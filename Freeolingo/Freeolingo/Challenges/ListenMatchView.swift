//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct ListenMatchView: View {
    var listenMatch: Challenge.ListenMatch
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var matches: [(Int, Int)] = []
    @State private var current: (Int, Int) = (-1, -1)
    @State private var shuffledLeft: [Int] = []
    @State private var shuffledRight: [Int] = []
    
    func setChoice(index: Int, value: Int) {
        if index == 0 {
            current.0 = shuffledLeft[value]
        } else if index == 1 {
            current.1 = shuffledRight[value]
        }
        
        if current.0 != -1 && current.1 != -1 {
            if current.0 == current.1 {
                // Right
                matches.append(current)
                current = (-1, -1)
                
                if matches.count == shuffledLeft.count {
                    onComplete(true, Text("Correct"))
                }
            } else {
                // Wrong
                var token = ""
                if index == 0 {
                    token = listenMatch.pairs[current.1].learningWord
                } else if index == 1 {
                    token = listenMatch.pairs[current.0].translation
                }
                onComplete(false, Text("No, it should be \(token)"))
            }
        }
    }
    
    var body: some View {
        VStack {
            ForEach(shuffledLeft.indices, id: \.self) { index in
                let leftIndex = shuffledLeft[index]
                let left = listenMatch.pairs[leftIndex]
                let rightIndex = shuffledRight[index]
                let right = listenMatch.pairs[rightIndex]
                
                HStack (alignment: .center, spacing: 50) {
                    TextWithTTSView(
                        icon: "speaker.wave.2",
                        speak: left.learningWord,
                        language: languageSettings.learningLanguage,
                        onTapGesture: { setChoice(index: 0, value: index) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .apply {
                        if current.0 == leftIndex { $0.background(.red) }
                        else if matches.map({ $0.0 }).contains(leftIndex) { $0.background(.gray) }
                        else { $0.background(.white) }
                    }
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { setChoice(index: 0, value: index) }
                    
                    TextWithTTSView(
                        icon: "speaker.wave.2",
                        speak: right.translation,
                        language: languageSettings.fromLanguage,
                        onTapGesture:  { setChoice(index: 1, value: index) }
                    )
                    .padding(.vertical, 10)
                    .padding(.horizontal, 15)
                    .apply {
                        if current.1 == rightIndex { $0.background(.red) }
                        else if matches.map({ $0.1 }).contains(rightIndex) { $0.background(.gray) }
                        else { $0.background(.white) }
                    }
                    .clipShape(RoundedRectangle(cornerSize: CGSize(width: 20, height: 10)))
                    .onTapGesture { setChoice(index: 1, value: index) }
                }
            }
        }
        .padding(.vertical, 100)
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .background(.green)
        .onChange(of: listenMatch) {
            matches = []
            current = (-1, -1)
            shuffledLeft = listenMatch.pairs.indices.shuffled()
            shuffledRight = listenMatch.pairs.indices.shuffled()
        }
        .onAppear {
            matches = []
            current = (-1, -1)
            shuffledLeft = listenMatch.pairs.indices.shuffled()
            shuffledRight = listenMatch.pairs.indices.shuffled()
        }
    }
}

#Preview {
    ListenMatchView(
        listenMatch: Challenge.ListenMatch(
            pairs: [
                Challenge.Pair(learningWord: "Hi", translation: "Oi"),
                Challenge.Pair(learningWord: "Bye", translation: "Tchau"),
                Challenge.Pair(learningWord: "No", translation: "Não"),
                Challenge.Pair(learningWord: "Yes", translation: "Sim")
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
}
