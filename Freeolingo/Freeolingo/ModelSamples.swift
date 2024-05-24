//
//  ModelSamples.swift
//  Freeolingo
//
//  Created by Giovanna Zanardini on 24/05/24.
//

import Foundation

func getChallenge(type: String, json: String) -> Challenge {
    do {
        return try Challenge(json: json)
    } catch {
        return Challenge(type: type)
    }
}

let ASSIST_CHALLENGE: Challenge = getChallenge(type: "assist", json: """
{
    "prompt": "vestido",
    "choices": ["calme", "robe", "riche"],
    "correctIndex": 1,
    "type": "assist",
    "id": "54203d475d044e88b71707d67d267f91"
}
""")
let COMPLETE_REVERSE_TRANSLATION_CHALLENGE: Challenge = getChallenge(type: "completeReverseTranslation", json: """
{
  "prompt": "A mulher come uma laranja.",
  "displayTokens": [
    {
      "text": "La",
      "isBlank": false
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "femme",
      "isBlank": true
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "mange",
      "isBlank": false
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "une",
      "isBlank": false
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "orange",
      "isBlank": false
    },
    {
      "text": ".",
      "isBlank": false
    }
  ],
  "tokens": [
    {
      "value": "A",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "la"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "à"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "l'"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "mulher",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "femme"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "come",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "(il/elle/on) mange"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "mange-t-il"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "mange-t-elle"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "uma",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "une"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "un"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "laranja",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "orange"
            }
          ]
        ]
      }
    },
    {
      "value": "."
    }
  ],
  "type": "completeReverseTranslation",
  "id": "0f9cbb5f3a8c406ca9d5379c43aaf762"
}
""")
let LISTEN_CHALLENGE: Challenge = getChallenge(type: "listen", json: """
""")
let LISTEN_COMPLETE_CHALLENGE: Challenge = getChallenge(type: "listenComplete", json: """
""")
let LISTEN_ISOLATION_CHALLENGE: Challenge = getChallenge(type: "listenIsolation", json: """
""")
let LISTEN_MATCH_CHALLENGE: Challenge = getChallenge(type: "listenMatch", json: """
""")
let LISTEN_SPEAK_CHALLENGE: Challenge = getChallenge(type: "listenSpeak", json: """
""")
let LISTEN_TAP_CHALLENGE: Challenge = getChallenge(type: "listenTap", json: """
""")
let MATCH_CHALLENGE: Challenge = getChallenge(type: "match", json: """
""")
let NAME_CHALLENGE: Challenge = getChallenge(type: "name", json: """
""")
let PARTIAL_REVERSE_TRANSLATE_CHALLENGE: Challenge = getChallenge(type: "partialReverseTranslate", json: """
""")
let SELECT_CHALLENGE: Challenge = getChallenge(type: "select", json: """
""")
let SPEAK_CHALLENGE: Challenge = getChallenge(type: "speak", json: """
""")
let TRANSLATE_CHALLENGE: Challenge = getChallenge(type: "translate", json: """
""")

let CHALLENGES: [Challenge] = [
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
//    LISTEN_CHALLENGE,
//    LISTEN_COMPLETE_CHALLENGE,
//    LISTEN_ISOLATION_CHALLENGE,
//    LISTEN_MATCH_CHALLENGE,
//    LISTEN_SPEAK_CHALLENGE,
//    LISTEN_TAP_CHALLENGE,
//    MATCH_CHALLENGE,
//    NAME_CHALLENGE,
//    PARTIAL_REVERSE_TRANSLATE_CHALLENGE,
//    SELECT_CHALLENGE,
//    SPEAK_CHALLENGE,
//    TRANSLATE_CHALLENGE,
]

let SESSIONS = [
    Session(id: "1", type: "LESSON", challenges: CHALLENGES),
    Session(id: "2", type: "LESSON", challenges: CHALLENGES),
    Session(id: "3", type: "LESSON", challenges: CHALLENGES),
    Session(id: "4", type: "LESSON", challenges: CHALLENGES),
    Session(id: "5", type: "LESSON", challenges: CHALLENGES),
]

let LEVELS = [
    Level(id: "1", name: "My level", sessions: SESSIONS),
    Level(id: "2", name: "My level", sessions: SESSIONS),
    Level(id: "3", name: "My level", sessions: SESSIONS),
    Level(id: "4", name: "My level", sessions: SESSIONS),
    Level(id: "5", name: "My level", sessions: SESSIONS),
    Level(id: "6", name: "My level", sessions: SESSIONS),
    Level(id: "7", name: "My level", sessions: SESSIONS),
]

let UNITS = [
    Unit(id: 1, name: "My unit", levels: LEVELS),
    Unit(id: 2, name: "My unit", levels: LEVELS),
    Unit(id: 3, name: "My unit", levels: LEVELS),
    Unit(id: 4, name: "My unit", levels: LEVELS),
    Unit(id: 5, name: "My unit", levels: LEVELS),
    Unit(id: 6, name: "My unit", levels: LEVELS)
]

let EXAMPLE_SENTENCE = Section.ExampleSentence(exampleSentence: "Example Sentence")

let SECTIONS = [
    Section(id: 1, name: "FIrst section", type: SectionType.learning, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 2, name: "FIrst section", type: SectionType.learning, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 3, name: "FIrst section", type: SectionType.learning, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 4, name: "FIrst section", type: SectionType.personalizedPractice, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 5, name: "FIrst section", type: SectionType.personalizedPractice, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 6, name: "FIrst section", type: SectionType.personalizedPractice, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 7, name: "FIrst section", type: SectionType.dailyRefresh, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
]

let COURSES = [
    Course(id: "1", fromLanguage: "pt", learningLanguage: "en", sections: SECTIONS),
    Course(id: "2", fromLanguage: "pt", learningLanguage: "es", sections: SECTIONS),
    Course(id: "3", fromLanguage: "pt", learningLanguage: "es", sections: SECTIONS),
    Course(id: "4", fromLanguage: "pt", learningLanguage: "es", sections: SECTIONS)
]
