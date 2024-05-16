//
//  Models.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation

struct Challenge: Decodable, Identifiable {
    struct DisplayToken: Decodable, Equatable {
        let text: String
        let isBlank: Bool
    }

    struct Token: Decodable, Equatable {
        let value: String
    }

    struct Option: Decodable, Hashable, Equatable {
        let text: String
    }

    struct Choice: Decodable, Hashable, Equatable {
        let text: String
    }

    struct Pair: Decodable, Hashable, Equatable {
        let learningWord: String
        let translation: String
    }

    struct MatchPair: Decodable, Hashable, Equatable {
        let learningToken: String
        let fromToken: String
    }

    struct SelectChoice: Decodable, Hashable, Equatable {
        let image: String
        let phrase: String
        let hint: String
    }

    //

    struct Assist: Decodable, Equatable {
        let prompt: String
        let choices: [String]
        let correctIndex: Int
    }

    struct CompleteReverseTranslation: Decodable, Equatable {
        let prompt: String
        let displayTokens: [DisplayToken]
    }

    struct Listen: Decodable, Equatable {
        let prompt: String
        let solutionTranslation: String
    }

    struct ListenComplete: Decodable, Equatable {
        let displayTokens: [DisplayToken]
        let solutionTranslation: String
    }

    struct ListenIsolation: Decodable, Equatable {
        let blankRangeStart: Int
        let blankRangeEnd: Int
        let tokens: [Token]
        let solutionTranslation: String
        let options: [Option]
        let correctIndex: Int
    }

    struct ListenMatch: Decodable, Equatable {
        let pairs: [Pair]
    }

    struct ListenSpeak: Decodable, Equatable {
        let prompt: String
        let solutionTranslation: String
        let choices: [String]
        let correctIndices: [Int]
    }
    
    struct ListenTap: Decodable, Equatable {
        let prompt: String
        let solutionTranslation: String
        let choices: [Choice]
        let correctIndices: [Int]
    }

    struct Match: Decodable, Equatable {
        let pairs: [MatchPair]
    }

    struct Name: Decodable, Equatable {
        let prompt: String
        let correctSolutions: [String]
    }

    struct PartialReverseTranslate: Decodable, Equatable {
        let prompt: String
        let displayTokens: [DisplayToken]
    }

    struct Select: Decodable, Equatable {
        let prompt: String
        let correctIndex: Int
        let choices: [SelectChoice]
    }

    struct Speak: Decodable, Equatable {
        let prompt: String
        let solutionTranslation: String
    }

    struct Translate: Decodable, Equatable {
        let prompt: String
        let correctSolutions: [String]
        let choices: [Choice]
        let correctIndices: [Int]
    }
    
    let id: String
    let type: String
    
    enum DataTypes {
        case assist(Assist),
            completeReverseTranslation(CompleteReverseTranslation),
            listen(Listen),
            listenComplete(ListenComplete),
            listenIsolation(ListenIsolation),
            listenMatch(ListenMatch),
            listenSpeak(ListenSpeak),
            listenTap(ListenTap),
            match(Match),
            name(Name),
            partialReverseTranslate(PartialReverseTranslate),
            select(Select),
            speak(Speak),
            translate(Translate)
    }
    
    let data: DataTypes?
    
    let rawData: String
    
    enum CodingKeys : CodingKey {
        case id, type, rawData, data
    }
    
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        id = try values.decode(String.self, forKey: .id)
        type = try values.decode(String.self, forKey: .type)
        rawData = try values.decode(String.self, forKey: .rawData)

        do {
            switch type {
            case "assist":
                data = try .assist(values.decode(Assist.self, forKey: .data))
            case "completeReverseTranslation":
                data = try .completeReverseTranslation(values.decode(CompleteReverseTranslation.self, forKey: .data))
            case "listen":
                data = try .listen(values.decode(Listen.self, forKey: .data))
            case "listenComplete":
                data = try .listenComplete(values.decode(ListenComplete.self, forKey: .data))
            case "listenIsolation":
                data = try .listenIsolation(values.decode(ListenIsolation.self, forKey: .data))
            case "listenMatch":
                data = try .listenMatch(values.decode(ListenMatch.self, forKey: .data))
            case "listenSpeak":
                data = try .listenSpeak(values.decode(ListenSpeak.self, forKey: .data))
            case "listenTap":
                data = try .listenTap(values.decode(ListenTap.self, forKey: .data))
            case "match":
                data = try .match(values.decode(Match.self, forKey: .data))
            case "name":
                data = try .name(values.decode(Name.self, forKey: .data))
            case "partialReverseTranslate":
                data = try .partialReverseTranslate(values.decode(PartialReverseTranslate.self, forKey: .data))
            case "select":
                data = try .select(values.decode(Select.self, forKey: .data))
            case "speak":
                data = try .speak(values.decode(Speak.self, forKey: .data))
            case "translate":
                data = try .translate(values.decode(Translate.self, forKey: .data))
            default:
                data = nil
            }
        } catch {
            print("Error")
            data = nil
        }
    }
}

struct Session: Decodable, Identifiable, Equatable {
    static func == (lhs: Session, rhs: Session) -> Bool {
        return lhs.id == rhs.id
    }
    
    let id: String
    let type: String
    
    let challenges: Array<Challenge>
}

struct Level: Decodable, Identifiable {
    let id: String
    let name: String
    
    let sessions: Array<Session>
}

struct Unit: Decodable, Identifiable {
    let id: Int
    let name: String
    
    let levels: Array<Level>
}

struct Section: Decodable, Identifiable {
    let id: Int
    let name: String
    let units: Array<Unit>
}

struct Course: Decodable, Identifiable {
    let id: String
    let fromLanguage: String
    let learningLanguage: String
    
    let sections: Array<Section>
}

