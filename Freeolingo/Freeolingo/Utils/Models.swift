//
//  Models.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 01/04/24.
//

import Foundation

struct Challenge: Codable, Identifiable {
    struct DisplayToken: Codable, Equatable {
        let text: String
        let isBlank: Bool
    }

    struct Token: Codable, Equatable {
        let value: String
    }

    struct Option: Codable, Hashable, Equatable {
        let text: String
    }

    struct Choice: Codable, Hashable, Equatable {
        let text: String
    }

    struct Pair: Codable, Hashable, Equatable {
        let learningWord: String
        let translation: String
    }

    struct MatchPair: Codable, Hashable, Equatable {
        let learningToken: String
        let fromToken: String
    }

    struct SelectChoice: Codable, Hashable, Equatable {
        let image: String
        let phrase: String
        let hint: String
    }

    //

    struct Assist: Codable, Equatable {
        let prompt: String
        let choices: [String]
        let correctIndex: Int
    }

    struct CompleteReverseTranslation: Codable, Equatable {
        let prompt: String
        let displayTokens: [DisplayToken]
    }

    struct Listen: Codable, Equatable {
        let prompt: String
        let solutionTranslation: String
    }

    struct ListenComplete: Codable, Equatable {
        let displayTokens: [DisplayToken]
        let solutionTranslation: String
    }

    struct ListenIsolation: Codable, Equatable {
        let blankRangeStart: Int
        let blankRangeEnd: Int
        let tokens: [Token]
        let solutionTranslation: String
        let options: [Option]
        let correctIndex: Int
    }

    struct ListenMatch: Codable, Equatable {
        let pairs: [Pair]
    }

    struct ListenSpeak: Codable, Equatable {
        let prompt: String
        let solutionTranslation: String
        let choices: [String]
        let correctIndices: [Int]
    }
    
    struct ListenTap: Codable, Equatable {
        let prompt: String
        let solutionTranslation: String
        let choices: [Choice]
        let correctIndices: [Int]
    }

    struct Match: Codable, Equatable {
        let pairs: [MatchPair]
    }

    struct Name: Codable, Equatable {
        let prompt: String
        let correctSolutions: [String]
    }

    struct PartialReverseTranslate: Codable, Equatable {
        let prompt: String
        let displayTokens: [DisplayToken]
    }

    struct Select: Codable, Equatable {
        let prompt: String
        let correctIndex: Int
        let choices: [SelectChoice]
    }

    struct Speak: Codable, Equatable {
        let prompt: String
        let solutionTranslation: String
    }

    struct Translate: Codable, Equatable {
        let prompt: String
        let correctSolutions: [String]
        let choices: [Choice]
        let correctIndices: [Int]
    }
    
    struct GapFill: Codable, Equatable {
        
    }
    
    let id: String
    let type: String
    
    enum DataTypes: Codable {
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
        case id, type, data
    }

    init(type: String) {
        self.id = "INVALID"
        self.type = type
        self.data = nil
    }
    
    init(json: String) throws {
        let challenge = try JSONDecoder().decode(Challenge.self, from: json.data(using: .utf8)!)
        
        id = challenge.id
        type = challenge.type
        data = challenge.data
    }
    
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        id = try values.decode(String.self, forKey: .id)
        type = try values.decode(String.self, forKey: .type)

        do {
            let specific = try decoder.singleValueContainer()
            switch type {
            case "assist":
                data = try .assist(specific.decode(Assist.self))
            case "completeReverseTranslation":
                data = try .completeReverseTranslation(specific.decode(CompleteReverseTranslation.self))
            case "listen":
                data = try .listen(specific.decode(Listen.self))
            case "listenComplete":
                data = try .listenComplete(specific.decode(ListenComplete.self))
            case "listenIsolation":
                data = try .listenIsolation(specific.decode(ListenIsolation.self))
            case "listenMatch":
                data = try .listenMatch(specific.decode(ListenMatch.self))
            case "listenSpeak":
                data = try .listenSpeak(specific.decode(ListenSpeak.self))
            case "listenTap":
                data = try .listenTap(specific.decode(ListenTap.self))
            case "match":
                data = try .match(specific.decode(Match.self))
            case "name":
                data = try .name(specific.decode(Name.self))
            case "partialReverseTranslate":
                data = try .partialReverseTranslate(specific.decode(PartialReverseTranslate.self))
            case "select":
                data = try .select(specific.decode(Select.self))
            case "speak":
                data = try .speak(specific.decode(Speak.self))
            case "translate":
                data = try .translate(specific.decode(Translate.self))
            case "gapFill":
                data = try .gapFill(specific.decode(GapFill.self))
            default:
                data = nil
            }
        } catch {
            print("Error \(error)")
            do {
                print(try decoder.singleValueContainer().decode(String.self))
            } catch {
                print("Another error \(error)")
            }
            data = nil
        }
    }
}

struct Session: Codable, Identifiable, Equatable {
    static func == (lhs: Session, rhs: Session) -> Bool {
        return lhs.id == rhs.id
    }
    
    let id: String
    let type: String
    
    let challenges: Array<Challenge>
}

struct Story: Codable, Equatable {
    static func == (lhs: Story, rhs: Story) -> Bool {
        return lhs.fromLanguageName == rhs.fromLanguageName
    }
    
    let fromLanguageName: String
}

enum LevelType: String, Codable {
    case chest = "chest"
    case skill = "skill"
    case unitReview = "unit_review"
    case practice = "practice"
    case story = "story"
}

struct PathLevelMetadata: Codable {
    let storyId: String?
}

struct Level: Codable, Identifiable, Equatable {
    static func == (lhs: Level, rhs: Level) -> Bool {
        return lhs.id == rhs.id
    }

    let id: Int
    let name: String
    let type: LevelType
    let totalSessions: Int
    let pathLevelMetadata: PathLevelMetadata?
    
    private enum CodingKeys : String, CodingKey {
        case id = "absoluteNodeIndex", name = "debugName", type, totalSessions, pathLevelMetadata
    }
}

struct Unit: Codable, Identifiable, Equatable {
    static func == (lhs: Unit, rhs: Unit) -> Bool {
        return lhs.id == rhs.id
    }
    
    let id: Int
    let name: String?
    
    let levels: Array<Level>
    
    private enum CodingKeys : String, CodingKey {
        case id = "unitIndex", name = "teachingObjective", levels
    }
}

enum SectionType: String, Codable {
    case dailyRefresh = "daily_refresh"
    case learning = "learning"
    case personalizedPractice = "personalized_practice"
}

struct Section: Codable, Equatable {
    static func == (lhs: Section, rhs: Section) -> Bool {
        return lhs.id == rhs.id
    }
    
    let id: Int
    let name: String?
    let type: SectionType
    let units: Array<Unit>
    
    struct ExampleSentence: Codable {
        let exampleSentence: String
    }

    let exampleSentence: ExampleSentence?
    
    private enum CodingKeys : String, CodingKey {
        case id = "index", name = "debugName", type, units, exampleSentence
    }
}

struct Course: Codable, Identifiable {
    let id: String
    let fromLanguage: String
    let learningLanguage: String
    
    let sections: Array<Section>
    
    private enum CodingKeys : String, CodingKey {
        case id, fromLanguage, learningLanguage, sections = "pathSectioned"
    }
}

struct AvailableCourse: Codable {
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
