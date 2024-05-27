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
    
    struct GapFill: Decodable, Equatable {
        
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
            translate(Translate),
            gapFill(GapFill)
    }
    
    let data: DataTypes?
    
    enum CodingKeys : CodingKey {
        case id, type, rawData, data
    }

    init(type: String) {
        self.id = "INVALID"
        self.type = type
        self.data = nil
    }
    
    init(json: String) throws {
        // TODO: Eventually get rid of this raw data thing, I want to fetch from the API instead of that converted JSON representation that I was using
        let decoded = try JSONSerialization.jsonObject(with: json.data(using: .utf8)!, options: []) as? [String: Any]
        let translated = [
            "id": decoded!["id"],
            "type": decoded!["type"],
            "data": decoded
        ]
        let jsonData = try JSONSerialization.data(withJSONObject: translated, options: [])
        let challenge = try JSONDecoder().decode(Challenge.self, from: jsonData)
        
        id = challenge.id
        type = challenge.type
        data = challenge.data
    }
    
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        id = try values.decode(String.self, forKey: .id)
        type = try values.decode(String.self, forKey: .type)

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
            case "gapFill":
                data = try .gapFill(values.decode(GapFill.self, forKey: .data))
            default:
                data = nil
            }
        } catch {
            print("Error \(error)")
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

enum LevelType: String, Decodable {
    case chest = "chest"
    case skill = "skill"
    case unitReview = "unit_review"
    case practice = "practice"
    case story = "story"
}


struct Level: Decodable, Identifiable {
    let id: String
    let name: String
    let type: LevelType
    let totalSessions: Int
    
//    var sessions: Array<Session> = []
    
    private enum CodingKeys : String, CodingKey {
        case id, name = "debugName", type, totalSessions
    }
}

struct Unit: Decodable, Identifiable {
    let id: Int
    let name: String?
    
    let levels: Array<Level>
    
    private enum CodingKeys : String, CodingKey {
        case id = "unitIndex", name = "teachingObjective", levels
    }
}

enum SectionType: String, Decodable {
    case dailyRefresh = "daily_refresh"
    case learning = "learning"
    case personalizedPractice = "personalized_practice"
}

struct Section: Decodable {
    let name: String?
    let type: SectionType
    let units: Array<Unit>
    
    struct ExampleSentence: Decodable {
        let exampleSentence: String
    }

    let exampleSentence: ExampleSentence?
    
    private enum CodingKeys : String, CodingKey {
        case name = "debugName", type, units, exampleSentence
    }
}

struct Course: Decodable, Identifiable {
    let id: String
    let fromLanguage: String
    let learningLanguage: String
    
    let sections: Array<Section>
    
    private enum CodingKeys : String, CodingKey {
        case id, fromLanguage, learningLanguage, sections = "pathSectioned"
    }
}

struct AvailableCourse: Decodable {
//    {
//        "num_learners": 332,
//        "from_language_name": "Russian",
//        "num_learners_string": "332",
//        "learning_language": "sv",
//        "learning_language_name": "Swedish",
//        "from_language_id": "ru",
//        "progress": 0,
//        "phase": 1,
//        "learning_language_id": "sv",
//        "from_language": "ru"
//    }
    let fromLanguage: String
    let fromLanguageName: String
    let learningLanguage: String
    let learningLanguageName: String
    let numLearners: Int
    
    private enum CodingKeys : String, CodingKey {
        case fromLanguage = "from_language_id"
        case fromLanguageName = "from_language_name"
        case learningLanguage = "learning_language"
        case learningLanguageName = "learning_language_name"
        case numLearners = "num_learners"
    }
}
