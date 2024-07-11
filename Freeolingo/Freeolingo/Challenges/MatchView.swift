//
//  AssistView.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 19/04/24.
//

import SwiftUI

struct MatchView: View {
    var match: Challenge.Match
    let languageSettings: LanguageSettings
    let onComplete: (Bool, Text) -> Void
    
    @State private var matches: [(Int, Int)] = []
    @State private var current: (Int, Int) = (-1, -1)
    @State private var shuffledLeft: [Int] = []
    @State private var shuffledRight: [Int] = []
    @State private var lastListened: (Int, Int) = (-1, -1)
    
    func setChoice(index: Int, value: Int) {
        if index == 0 {
            if current.0 != -1 && current.1 != -1 {
                // They got it wrong earlier, reset
                current.0 = -1
            }
            if lastListened.0 == shuffledLeft[value] || lastListened.1 == -1 {
                // We confirmed that we want this one or we are starting a combination
                current.0 = shuffledLeft[value]
            }
            lastListened.0 = shuffledLeft[value]
        } else if index == 1 {
            if current.0 != -1 && current.1 != -1 {
                // They got it wrong earlier, reset
                current.1 = -1
            }
            if lastListened.1 == shuffledRight[value] || lastListened.0 == -1 {
                // We confirmed that we want this one or we are starting a combination
                current.1 = shuffledRight[value]
            }
            lastListened.1 = shuffledRight[value]
        }
        
        if current.0 != -1 && current.1 != -1 {
            if current.0 == current.1 {
                // Right
                matches.append(current)
                current = (-1, -1)
                lastListened = (-1, -1)
                
                if matches.count == shuffledLeft.count {
                    onComplete(true, Text("Correct"))
                }
            } else {
                // Wrong
                var token = ""
                if index == 0 {
                    token = match.pairs[current.1].learningToken
                } else if index == 1 {
                    token = match.pairs[current.0].fromToken
                }
                onComplete(false, Text("No, it should be \(token)"))
            }
        }
    }
    
    var body: some View {
        VStack {
            ForEach(shuffledLeft.indices, id: \.self) { index in
                HStack (alignment: .center, spacing: 50) {
                    let leftIndex = shuffledLeft[index]
                    let left = match.pairs[leftIndex]
                    let leftAlreadyMatched = matches.map({ $0.0 }).contains(leftIndex)
                    
                    MatchButtonWithTTSView(
                        speak: left.learningToken,
                        language: languageSettings.learningLanguage,
                        isLastListened: lastListened.0 == leftIndex,
                        isSelected: current.0 == leftIndex,
                        isSelectable: !leftAlreadyMatched,
                        isWrong: current.0 != -1 && current.1 != -1 && current.0 != current.1,
                        type: .text
                    ) {
                        setChoice(index: 0, value: index)
                    }
                    
                    let rightIndex = shuffledRight[index]
                    let right = match.pairs[rightIndex]
                    let rightAlreadyMatched = matches.map({ $0.1 }).contains(rightIndex)
                    
                    MatchButtonWithTTSView(
                        speak: right.fromToken,
                        language: languageSettings.fromLanguage,
                        isLastListened: lastListened.1 == rightIndex,
                        isSelected: current.1 == rightIndex,
                        isSelectable: !rightAlreadyMatched,
                        isWrong: current.0 != -1 && current.1 != -1 && current.0 != current.1,
                        type: .text
                    ) {
                        setChoice(index: 1, value: index)
                    }
                }
                .padding(.all, 10)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(maxHeight: .infinity)
        .onChange(of: match) {
            matches = []
            current = (-1, -1)
            shuffledLeft = match.pairs.indices.shuffled()
            shuffledRight = match.pairs.indices.shuffled()
            lastListened = (-1, -1)
        }
        .onAppear {
            matches = []
            current = (-1, -1)
            shuffledLeft = match.pairs.indices.shuffled()
            shuffledRight = match.pairs.indices.shuffled()
            lastListened = (-1, -1)
        }
    }
}

#Preview {
    MatchView(
        match: Challenge.Match(
            pairs: [
                Challenge.MatchPair(learningToken: "Hi", fromToken: "Oi"),
                Challenge.MatchPair(learningToken: "Bye", fromToken: "Tchau"),
                Challenge.MatchPair(learningToken: "Yes", fromToken: "Sim"),
                Challenge.MatchPair(learningToken: "No", fromToken: "Não"),
            ]
        ),
        languageSettings: LanguageSettings(
            fromLanguage: "pt_BR", learningLanguage: "fr_FR"
        ),
        onComplete: {isCorrect,_ in print("Is correct: \(isCorrect)")}
    )
    .environmentObject(Speaker())
    .background(.red.lighter(by: 0.3))
}
