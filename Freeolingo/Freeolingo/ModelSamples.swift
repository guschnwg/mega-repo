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
{
      "prompt": "Elle m'a servi un poisson.",
      "solutionTranslation": "Ela me serviu um peixe.",
      "tts": "https://d1vq87e9lcf771.cloudfront.net/falstafffr/82fb36ef7c96bb96c5b6dde2a03e1d6d",
      "slowTts": "https://d1vq87e9lcf771.cloudfront.net/falstafffr/a1b1220e5ea471bfdb7241a5942cba45",
      "grader": {
        "version": 0,
        "vertices": [
          [
            {
              "to": 1,
              "lenient": ""
            }
          ],
          [
            {
              "to": 2,
              "lenient": "elle",
              "orig": "Elle"
            }
          ],
          [
            {
              "to": 3,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "m'a"
            },
            {
              "to": 10,
              "lenient": "m'",
              "auto": true
            },
            {
              "to": 12,
              "lenient": "m",
              "type": "typo",
              "auto": true
            }
          ],
          [
            {
              "to": 5,
              "lenient": " "
            }
          ],
          [
            {
              "to": 6,
              "lenient": "servi"
            }
          ],
          [
            {
              "to": 7,
              "lenient": " "
            }
          ],
          [
            {
              "to": 8,
              "lenient": "un"
            },
            {
              "to": 8,
              "lenient": "1",
              "auto": true
            }
          ],
          [
            {
              "to": 9,
              "lenient": " "
            }
          ],
          [
            {
              "to": 14,
              "lenient": "poisson",
              "orig": "poisson."
            }
          ],
          [
            {
              "to": 11,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "a",
              "auto": true
            }
          ],
          [
            {
              "to": 13,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "a",
              "type": "typo",
              "auto": true
            }
          ],
          []
        ],
        "language": "fr",
        "whitespaceDelimited": true
      },
      "type": "listen",
      "id": "73bb1faee95649369531e1fd4c056c7c"
    }
""")
let LISTEN_COMPLETE_CHALLENGE: Challenge = getChallenge(type: "listenComplete", json: """
{
      "character": {
        "url": "https://d2pur3iezf4d1j.cloudfront.net/images/61e19bb4a1ff1d94e58d58b33db58c36",
        "image": {
          "pdf": "https://d2pur3iezf4d1j.cloudfront.net/images/61e19bb4a1ff1d94e58d58b33db58c36",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/52a5a774c4de18f4a4e8c91d91788347"
        },
        "gender": "MALE",
        "correctAnimation": "https://simg-ssl.duolingo.com/lottie/Vikram_CORRECT_Cropped_SpiritFingers.json",
        "incorrectAnimation": "https://simg-ssl.duolingo.com/lottie/Dan_INCORRECT_Cropped.json",
        "idleAnimation": "https://simg-ssl.duolingo.com/lottie/Vikram_IDLE_Cropped.json",
        "name": "VIKRAM",
        "avatarIconImage": {
          "pdf": "https://simg-ssl.duolingo.com/world-characters/avatars/vikram_avatar_icon.pdf",
          "svg": "https://simg-ssl.duolingo.com/world-characters/avatars/vikram_avatar_icon.svg"
        }
      },
      "displayTokens": [
        {
          "text": "J'",
          "isBlank": false
        },
        {
          "text": "ai",
          "isBlank": false
        },
        {
          "text": " ",
          "isBlank": false
        },
        {
          "text": "compris",
          "isBlank": true
        },
        {
          "text": " ",
          "isBlank": false
        },
        {
          "text": "ce",
          "isBlank": false
        },
        {
          "text": " ",
          "isBlank": false
        },
        {
          "text": "dictionnaire",
          "isBlank": false
        },
        {
          "text": ".",
          "isBlank": false
        }
      ],
      "grader": {
        "version": 0,
        "vertices": [
          [
            {
              "to": 1,
              "lenient": ""
            }
          ],
          [
            {
              "to": 2,
              "lenient": "j'ai",
              "orig": "J'ai"
            },
            {
              "to": 2,
              "lenient": "jai",
              "orig": "Jai"
            },
            {
              "to": 8,
              "lenient": "j'",
              "auto": true,
              "orig": "J'"
            },
            {
              "auto": true,
              "to": 10,
              "lenient": "j",
              "orig": "J",
              "type": "typo"
            }
          ],
          [
            {
              "to": 3,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "compris"
            }
          ],
          [
            {
              "to": 5,
              "lenient": " "
            }
          ],
          [
            {
              "to": 6,
              "lenient": "ce"
            }
          ],
          [
            {
              "to": 7,
              "lenient": " "
            }
          ],
          [
            {
              "to": 12,
              "lenient": "dictionnaire",
              "orig": "dictionnaire."
            }
          ],
          [
            {
              "to": 9,
              "lenient": " "
            }
          ],
          [
            {
              "to": 2,
              "lenient": "ai",
              "auto": true
            }
          ],
          [
            {
              "to": 11,
              "lenient": " "
            }
          ],
          [
            {
              "to": 2,
              "lenient": "ai",
              "type": "typo",
              "auto": true
            }
          ],
          []
        ],
        "language": "fr",
        "whitespaceDelimited": true
      },
      "slowTts": "https://d1vq87e9lcf771.cloudfront.net/vikramfr/3636eefec8b5eee49163e8ce0c784450",
      "solutionTranslation": "Eu entendi esse dicionário.",
      "tts": "https://d1vq87e9lcf771.cloudfront.net/vikramfr/3b44abbf73ce600dddcf726f09c6b706",
      "type": "listenComplete",
      "id": "adc3af1eaa97426e8393380cd3791d71",
      "progressUpdates": [],
      "sentenceId": "d4dcae76de1f2950c901c4f154517d81"
}
""")
let LISTEN_ISOLATION_CHALLENGE: Challenge = getChallenge(type: "listenIsolation", json: """
{
      "blankRangeEnd": 1,
      "blankRangeStart": 0,
      "character": {
        "url": "https://d2pur3iezf4d1j.cloudfront.net/images/3f4adf80c0b6e9a0dc438f3ba8119703",
        "image": {
          "pdf": "https://d2pur3iezf4d1j.cloudfront.net/images/3f4adf80c0b6e9a0dc438f3ba8119703",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/6d99bc8306bdaacc3c8acc911214c557"
        },
        "gender": "FEMALE",
        "correctAnimation": "https://simg-ssl.duolingo.com/lottie/Zari_CORRECT_Cropped_Spin.json",
        "incorrectAnimation": "https://simg-ssl.duolingo.com/lottie/Pink_INCORRECT_Cropped.json",
        "idleAnimation": "https://simg-ssl.duolingo.com/lottie/Zari_IDLE_Cropped.json",
        "name": "ZARI",
        "avatarIconImage": {
          "pdf": "https://simg-ssl.duolingo.com/world-characters/avatars/zari_avatar_icon.pdf",
          "svg": "https://simg-ssl.duolingo.com/world-characters/avatars/zari_avatar_icon.svg"
        }
      },
      "correctIndex": 0,
      "options": [
        {
          "text": "elle",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/e524d83870220275082015701353854d"
        },
        {
          "text": "quel",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/8c9c93cdb9b8f183ca456dd8c456be0c"
        }
      ],
      "solutionTranslation": "Ela tem uma maçã.",
      "tokens": [
        {
          "value": "Elle",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/e524d83870220275082015701353854d",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "ela"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "a",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/72f70eaaa01db7447b9539ea0fa7807e",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "tem"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "possui"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "está com"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "une",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/2569b9596401c9d01c0814cb1640327f",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "uma"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "manchete"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "alguma"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "pomme",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/855c9045d3b7ad05cb8df85954eaa448",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "maçã"
                }
              ]
            ]
          }
        },
        {
          "value": "."
        }
      ],
      "tts": "https://d1vq87e9lcf771.cloudfront.net/zarifr/baf403521068a388f012609b570a3b20",
      "type": "listenIsolation",
      "id": "691d2ff9e256463e9611123de0fa1307",
}
""")
let LISTEN_MATCH_CHALLENGE: Challenge = getChallenge(type: "listenMatch", json: """
{
      "pairs": [
        {
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/9a562a0683f940d6391f99068c51f6e1",
          "translation": "vestido",
          "learningWord": "robe"
        },
        {
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/2115e65ef8f10fd7e9516ae20b2a1fb2",
          "translation": "boa",
          "learningWord": "bonne"
        },
        {
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/f839cd430f816972aa7169be48974f87",
          "translation": "bem",
          "learningWord": "bien"
        },
        {
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/8894ad6883b21d16d220b9f5da198b21",
          "translation": "é",
          "learningWord": "es"
        }
      ],
      "type": "listenMatch",
      "id": "46e78b7b7eeb4b45ba7323d682ffca1e",
      "progressUpdates": []
    }
""")
let LISTEN_SPEAK_CHALLENGE: Challenge = getChallenge(type: "listenSpeak", json: """
{
      "character": {
        "url": "https://d2pur3iezf4d1j.cloudfront.net/images/3f195e9533fc5e4f61a32eba3f03a8cf",
        "image": {
          "pdf": "https://d2pur3iezf4d1j.cloudfront.net/images/3f195e9533fc5e4f61a32eba3f03a8cf",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/85c5ecb885f7073a3aebeb775946e329"
        },
        "gender": "FEMALE",
        "correctAnimation": "https://simg-ssl.duolingo.com/lottie/Lin_CORRECT_Cropped_Sunglasses.json",
        "incorrectAnimation": "https://simg-ssl.duolingo.com/lottie/Kai_INCORRECT_Cropped.json",
        "idleAnimation": "https://simg-ssl.duolingo.com/lottie/Lin_IDLE_Cropped.json",
        "name": "LIN",
        "avatarIconImage": {
          "pdf": "https://simg-ssl.duolingo.com/world-characters/avatars/lin_avatar_icon.pdf",
          "svg": "https://simg-ssl.duolingo.com/world-characters/avatars/lin_avatar_icon.svg"
        }
      },
      "choices": [
        "Mapa",
        "do",
        "castelo",
        "óleo",
        "na",
        "sal",
        "limão",
        "Mm"
      ],
      "correctIndices": [
        0,
        1,
        2
      ],
      "prompt": "Plan du château",
      "slowTts": "https://d1vq87e9lcf771.cloudfront.net/linfr/80e4443643d78f1b13062981669dcf70",
      "solutionTranslation": "Mapa do castelo",
      "threshold": 0.5,
      "taggedKcIds": [
        {
          "legacyId": "d7167171a5777e4b7a868a40ce5cad92",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "0cbf09b9f0d3767395f1b68918b95c65",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "4ce3fb03676ecd03995a0ae03c6870f3",
          "kcTypeStr": "lex"
        }
      ],
      "tokens": [
        {
          "value": "Plan",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/linfr/dcb5b184d3cf197edf83d8e04cb49be3",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "mapa"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "plano"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "du",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/linfr/2a52b725b530c613900ed02a988f91f8",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "do"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "da"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "—"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "château",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/linfr/410f7c6ff9fe54725a1421c99a5d7236",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "castelo"
                }
              ]
            ]
          }
        }
      ],
      "tts": "https://d1vq87e9lcf771.cloudfront.net/linfr/d441218504650a2acd3da2b12cdab01a",
      "type": "listenSpeak",
      "id": "f3c15377a6f34ee38df69302de2b30cb",
      "progressUpdates": [],
      "sentenceId": "d0236c611df2e3ef7bd2bb0bd93e147f"
    }
""")
let LISTEN_TAP_CHALLENGE: Challenge = getChallenge(type: "listenTap", json: """
{
      "prompt": "Le cœur est un organe.",
      "correctTokens": [
        "Le",
        "cœur",
        "est",
        "un",
        "organe"
      ],
      "wrongTokens": [
        "une",
        "calme",
        "chat",
        "enfant"
      ],
      "choices": [
        {
          "text": "Le",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/ca1ffa8bc37c1bb1da3459c825da65d9"
        },
        {
          "text": "cœur",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/fa55d6c9091abd5f4623f670cb978a6e"
        },
        {
          "text": "est",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/abc620b26452bb26e4fe5a1df039c538"
        },
        {
          "text": "un",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/89b2511798ce14d843da0b80ee03093b"
        },
        {
          "text": "organe",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/8a4c3e499f265f599af9bb6386ff025b"
        },
        {
          "text": "une",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/9da9d3314e4087986594b839095265e9"
        },
        {
          "text": "calme",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/441d8820c3f7d6739dc3c61af4f977f1"
        },
        {
          "text": "chat",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/f0cb17c0f0d55aee3d59959854eda98a"
        },
        {
          "text": "enfant",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/1d5af41539bbedb3274cc184f4f449b0"
        }
      ],
      "correctIndices": [
        0,
        1,
        2,
        3,
        4
      ],
      "solutionTranslation": "O coração é um órgão.",
      "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/524cf63b238631aaf7ee577676a0fbf5",
      "slowTts": "https://d1vq87e9lcf771.cloudfront.net/victor/6c9eb0773e3f02feccef4a4e5451585b",
      "grader": {
        "version": 0,
        "vertices": [
          [
            {
              "to": 1,
              "lenient": ""
            }
          ],
          [
            {
              "to": 2,
              "lenient": "le",
              "orig": "Le"
            },
            {
              "to": 2,
              "lenient": "el",
              "type": "typo",
              "orig": "Le"
            }
          ],
          [
            {
              "to": 3,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "cœur"
            },
            {
              "to": 4,
              "lenient": "coeur"
            }
          ],
          [
            {
              "to": 5,
              "lenient": " "
            }
          ],
          [
            {
              "to": 6,
              "lenient": "est"
            }
          ],
          [
            {
              "to": 7,
              "lenient": " "
            }
          ],
          [
            {
              "to": 8,
              "lenient": "un"
            },
            {
              "to": 8,
              "lenient": "1",
              "auto": true
            }
          ],
          [
            {
              "to": 9,
              "lenient": " "
            }
          ],
          [
            {
              "to": 10,
              "lenient": "organe",
              "orig": "organe."
            }
          ],
          []
        ],
        "language": "fr",
        "whitespaceDelimited": true
      },
      "type": "listenTap",
      "id": "7d05117d15724c8ab248c5f337066038",
      "newWords": [],
      "progressUpdates": [],
      "sentenceId": "8275642add7c83704e34bf1dd6aa6d69"
    }
""")
let MATCH_CHALLENGE: Challenge = getChallenge(type: "match", json: """
{
      "pairs": [
        {
          "learningToken": "elle",
          "fromToken": "ela",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/aff4ce70dd29106f848ee89ba53ece81"
        },
        {
          "learningToken": "calme",
          "fromToken": "calmo",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/bb32a65ea2808397249c5b6383283591"
        },
        {
          "learningToken": "robe",
          "fromToken": "vestido",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/f21254df7f1805e166a7dc7de73916ea"
        },
        {
          "learningToken": "et",
          "fromToken": "e",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/806663bcd6a39820a44701373ec2691f"
        },
        {
          "learningToken": "chat",
          "fromToken": "gato",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/victor/f0cb17c0f0d55aee3d59959854eda98a"
        }
      ],
      "type": "match",
      "id": "4ab8f072cdbb4f39901e7a651f14e765",
      "newWords": [],
      "progressUpdates": []
    }
""")
let NAME_CHALLENGE: Challenge = getChallenge(type: "name", json: """
{
      "prompt": "a altura",
      "correctSolutions": [
        "la hauteur"
      ],
      "images": [],
      "solutionTts": "https://d1vq87e9lcf771.cloudfront.net/danielle/a7a4fc046f08cd668cc78ef02811504f",
      "grader": {
        "version": 0,
        "vertices": [
          [
            {
              "to": 1,
              "lenient": ""
            }
          ],
          [
            {
              "to": 2,
              "lenient": "la"
            },
            {
              "to": 2,
              "lenient": "al",
              "type": "typo",
              "orig": "la"
            }
          ],
          [
            {
              "to": 3,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "hauteur"
            }
          ],
          []
        ],
        "language": "fr",
        "whitespaceDelimited": true
      },
      "svgs": [
        "https://d2pur3iezf4d1j.cloudfront.net/images/ebca7f44604b6053aea42b0275771b3c"
      ],
      "type": "name",
      "id": "361dc6b3b5d041c7b897874f8ce4533e",
      "newWords": [],
      "progressUpdates": []
    }
""")
let PARTIAL_REVERSE_TRANSLATE_CHALLENGE: Challenge = getChallenge(type: "partialReverseTranslate", json: """
{
  "prompt": "Nós voltamos muito tarde.",
  "displayTokens": [
    {
      "text": "Nous",
      "isBlank": true
    },
    {
      "text": " ",
      "isBlank": true
    },
    {
      "text": "sommes",
      "isBlank": true
    },
    {
      "text": " ",
      "isBlank": true
    },
    {
      "text": "rentrés",
      "isBlank": true
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "très",
      "isBlank": false
    },
    {
      "text": " ",
      "isBlank": false
    },
    {
      "text": "tard",
      "isBlank": false
    },
    {
      "text": ".",
      "isBlank": false
    }
  ],
  "grader": {
    "version": 0,
    "vertices": [
      [
        {
          "to": 1,
          "lenient": ""
        }
      ],
      [
        {
          "to": 2,
          "lenient": "nous",
          "orig": "Nous"
        },
        {
          "to": 10,
          "lenient": "nous",
          "orig": "Nous"
        },
        {
          "to": 14,
          "lenient": "nous",
          "orig": "Nous"
        },
        {
          "to": 18,
          "lenient": "nous",
          "orig": "Nous"
        },
        {
          "to": 22,
          "lenient": "nous",
          "orig": "Nous"
        }
      ],
      [
        {
          "to": 3,
          "lenient": " "
        }
      ],
      [
        {
          "to": 4,
          "lenient": "sommes"
        }
      ],
      [
        {
          "to": 5,
          "lenient": " "
        }
      ],
      [
        {
          "to": 6,
          "lenient": "rentrées"
        },
        {
          "to": 6,
          "lenient": "rentrés"
        }
      ],
      [
        {
          "to": 7,
          "lenient": " "
        }
      ],
      [
        {
          "to": 8,
          "lenient": "très"
        }
      ],
      [
        {
          "to": 9,
          "lenient": " "
        }
      ],
      [
        {
          "to": 26,
          "lenient": "tard",
          "orig": "tard."
        }
      ],
      [
        {
          "to": 11,
          "lenient": " "
        }
      ],
      [
        {
          "to": 12,
          "lenient": "sommes"
        }
      ],
      [
        {
          "to": 13,
          "lenient": " "
        }
      ],
      [
        {
          "to": 6,
          "lenient": "retournées"
        }
      ],
      [
        {
          "to": 15,
          "lenient": " "
        }
      ],
      [
        {
          "to": 16,
          "lenient": "sommes"
        }
      ],
      [
        {
          "to": 17,
          "lenient": " "
        }
      ],
      [
        {
          "to": 6,
          "lenient": "retournés"
        }
      ],
      [
        {
          "to": 19,
          "lenient": " "
        }
      ],
      [
        {
          "to": 20,
          "lenient": "sommes"
        }
      ],
      [
        {
          "to": 21,
          "lenient": " "
        }
      ],
      [
        {
          "to": 6,
          "lenient": "revenues"
        }
      ],
      [
        {
          "to": 23,
          "lenient": " "
        }
      ],
      [
        {
          "to": 24,
          "lenient": "sommes"
        }
      ],
      [
        {
          "to": 25,
          "lenient": " "
        }
      ],
      [
        {
          "to": 6,
          "lenient": "revenus"
        }
      ],
      []
    ],
    "language": "fr",
    "whitespaceDelimited": true
  },
  "tokens": [
    {
      "value": "Nós",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "nous"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "voltamos",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "sommes rentrés / sommes rentrées"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "muito",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "très"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "beaucoup"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "beaucoup de"
            }
          ]
        ]
      }
    },
    {
      "value": " "
    },
    {
      "value": "tarde",
      "hintTable": {
        "headers": [],
        "rows": [
          [
            {
              "colspan": 1,
              "hint": "tard"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "après-midi"
            }
          ],
          [
            {
              "colspan": 1,
              "hint": "midi"
            }
          ]
        ]
      }
    },
    {
      "value": "."
    }
  ],
  "tts": "https://d1vq87e9lcf771.cloudfront.net/ricardo/507f05286d546e5d95dd8416808c1861",
  "type": "partialReverseTranslate",
  "id": "45f9de7e164c4878989fa15ccd4a28ba"
}
""")
let SELECT_CHALLENGE: Challenge = getChallenge(type: "select", json: """
{
      "prompt": "o vestido",
      "choices": [
        {
          "image": "https://d2pur3iezf4d1j.cloudfront.net/images/9aa862ebf2f8636383e54ce23d340db9",
          "phrase": "le chat",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/9aa862ebf2f8636383e54ce23d340db9",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/b3cd800f176a88cf275b9c3e730ecaca",
          "hint": "o gato"
        },
        {
          "image": "https://d2pur3iezf4d1j.cloudfront.net/images/d753ed22f4bb63de85a295702d469e10",
          "phrase": "la robe",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/d753ed22f4bb63de85a295702d469e10",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/5eddc7f2460b7636bfbc4d1068018e14",
          "hint": "o vestido"
        },
        {
          "image": "https://d2pur3iezf4d1j.cloudfront.net/images/a443582c1eb03f3fcebfff4febdba3e4",
          "phrase": "la fille",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/a443582c1eb03f3fcebfff4febdba3e4",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/danielle/586be1439200fe335ae520b16b56d777",
          "hint": "A menina"
        }
      ],
      "correctIndex": 1,
      "type": "select",
      "id": "f2e7b4402de041b187a4a13b18f1f043",
      "newWords": [
        "robe"
      ],
      "progressUpdates": []
    }
""")
let SPEAK_CHALLENGE: Challenge = getChallenge(type: "speak", json: """
{
      "prompt": "Les hommes sont riches.",
      "solutionTranslation": "Os homens são ricos.",
      "soundId": "noaq9JlnOWL7auiS",
      "threshold": 0.5,
      "tokens": [
        {
          "value": "Les",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/lilyfr/f6673f92017e050f043f9bc00e605291",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "os"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "os seus"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "as"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "hommes",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/lilyfr/428b629569d5f15de3e44b78dad7cd6f",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "homens"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "sont",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/lilyfr/4520ae5c4d14a49b6a2a014571656fc4",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "são"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "estão"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "ficam"
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "riches",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/lilyfr/2bac83291a04e70760b8a825baa6b8c1",
          "hintTable": {
            "headers": [],
            "rows": [
              [
                {
                  "colspan": 1,
                  "hint": "ricos"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "ricas"
                }
              ]
            ]
          }
        },
        {
          "value": "."
        }
      ],
      "tts": "https://d1vq87e9lcf771.cloudfront.net/lilyfr/f8336f88924bf2dde64d8c286c8a45b4",
      "correctTokens": [],
      "wrongTokens": [],
      "choices": [],
      "correctIndices": [],
      "character": {
        "url": "https://d2pur3iezf4d1j.cloudfront.net/images/861252b26a49194f2a98ee58e7c373f8",
        "image": {
          "pdf": "https://d2pur3iezf4d1j.cloudfront.net/images/861252b26a49194f2a98ee58e7c373f8",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/81ca92172d70599306b16bcb87799195"
        },
        "gender": "FEMALE",
        "correctAnimation": "https://simg-ssl.duolingo.com/lottie/Lily_CORRECT_Cropped_BigWhoop.json",
        "incorrectAnimation": "https://simg-ssl.duolingo.com/lottie/Violet_INCORRECT_Cropped.json",
        "idleAnimation": "https://simg-ssl.duolingo.com/lottie/Lily_IDLE_Cropped.json",
        "name": "LILY",
        "avatarIconImage": {
          "pdf": "https://simg-ssl.duolingo.com/world-characters/avatars/lily_avatar_icon.pdf",
          "svg": "https://simg-ssl.duolingo.com/world-characters/avatars/lily_avatar_icon.svg"
        }
      },
      "taggedKcIds": [
        {
          "legacyId": "631d297c324518ea97ac01fd2abd6e46",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "74006bc05725c2d7fa3c04e0785513a7",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "a142dd0d11d54e044e4b66f65953b0a7",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "d9277f61d9ea7c4bc8018cbe3ca8f476",
          "kcTypeStr": "lex"
        }
      ],
      "type": "speak",
      "id": "566bbb3a90e04564a907cef07d62d80d",
      "newWords": [],
      "progressUpdates": [],
      "sentenceId": "ee6fdbd667ca9185fc5a7a5949dc478f"
    }
""")
let TRANSLATE_CHALLENGE: Challenge = getChallenge(type: "translate", json: """
{
      "prompt": "La robe",
      "correctSolutions": [
        "O vestido"
      ],
      "compactTranslations": [
        "O vestido"
      ],
      "correctTokens": [
        "O",
        "vestido"
      ],
      "wrongTokens": [
        "diferente",
        "ensino",
        "estudantes",
        "escrevi"
      ],
      "choices": [
        {
          "text": "O"
        },
        {
          "text": "vestido"
        },
        {
          "text": "diferente"
        },
        {
          "text": "ensino"
        },
        {
          "text": "estudantes"
        },
        {
          "text": "escrevi"
        }
      ],
      "correctIndices": [
        0,
        1
      ],
      "sourceLanguage": "fr",
      "targetLanguage": "pt",
      "grader": {
        "version": 0,
        "vertices": [
          [
            {
              "to": 1,
              "lenient": ""
            }
          ],
          [
            {
              "to": 2,
              "lenient": "o",
              "orig": "O"
            }
          ],
          [
            {
              "to": 3,
              "lenient": " "
            }
          ],
          [
            {
              "to": 4,
              "lenient": "vestido"
            }
          ],
          []
        ],
        "language": "pt",
        "whitespaceDelimited": true
      },
      "taggedKcIds": [
        {
          "legacyId": "03a546003e03b545a6d419b6620b3749",
          "kcTypeStr": "lex"
        },
        {
          "legacyId": "26f6b357718b150404303812a222e348",
          "kcTypeStr": "lex"
        }
      ],
      "weakWordPromptRanges": [],
      "tokens": [
        {
          "value": "La",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/falstafffr/375b92e5ac6d0f8fd74a4fa874f500b6",
          "hintTable": {
            "headers": [
              "la",
              "robe"
            ],
            "rows": [
              [
                {
                  "colspan": 2,
                  "hint": "O vestido"
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "o"
                },
                {
                  "colspan": 1
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "a"
                },
                {
                  "colspan": 1
                }
              ],
              [
                {
                  "colspan": 1,
                  "hint": "da"
                },
                {
                  "colspan": 1
                }
              ]
            ]
          }
        },
        {
          "value": " "
        },
        {
          "value": "robe",
          "tts": "https://d1vq87e9lcf771.cloudfront.net/falstafffr/e697ef72c3f32cab07aead3a9bb68305",
          "hintTable": {
            "headers": [
              "la",
              "robe"
            ],
            "rows": [
              [
                {
                  "colspan": 2,
                  "hint": "O vestido"
                }
              ],
              [
                {
                  "colspan": 1
                },
                {
                  "colspan": 1,
                  "hint": "vestido"
                }
              ]
            ]
          }
        }
      ],
      "tts": "https://d1vq87e9lcf771.cloudfront.net/falstafffr/3d34e629b4ceb5ae0041237eeff9e08c",
      "character": {
        "url": "https://d2pur3iezf4d1j.cloudfront.net/images/51d3bded9ecbd8bf6e9869041c437ba9",
        "image": {
          "pdf": "https://d2pur3iezf4d1j.cloudfront.net/images/51d3bded9ecbd8bf6e9869041c437ba9",
          "svg": "https://d2pur3iezf4d1j.cloudfront.net/images/0f284113af41f7f7296263183701a13b"
        },
        "gender": "MALE",
        "correctAnimation": "https://simg-ssl.duolingo.com/lottie/Falstaff_CORRECT_Cropped_Tango.json",
        "incorrectAnimation": "https://simg-ssl.duolingo.com/lottie/Bear_INCORRECT_Cropped.json",
        "idleAnimation": "https://simg-ssl.duolingo.com/lottie/Falstaff_IDLE_Cropped.json",
        "name": "FALSTAFF",
        "avatarIconImage": {
          "pdf": "https://simg-ssl.duolingo.com/world-characters/avatars/falstaff_avatar_icon.pdf",
          "svg": "https://simg-ssl.duolingo.com/world-characters/avatars/falstaff_avatar_icon.svg"
        }
      },
      "isSpeakerUniversal": false,
      "type": "translate",
      "id": "a0ace21ab68347ec9dbaa912d0220364",
      "newWords": [],
      "progressUpdates": [],
      "sentenceId": "9ec7f5bc8df6cd3078af1993818b851b"
    }
""")

let CHALLENGES: [Challenge] = [
    ASSIST_CHALLENGE,
    COMPLETE_REVERSE_TRANSLATION_CHALLENGE,
    LISTEN_COMPLETE_CHALLENGE,
    LISTEN_ISOLATION_CHALLENGE,
    LISTEN_MATCH_CHALLENGE,
    LISTEN_SPEAK_CHALLENGE,
    LISTEN_TAP_CHALLENGE,
    LISTEN_CHALLENGE,
    MATCH_CHALLENGE,
    NAME_CHALLENGE,
    PARTIAL_REVERSE_TRANSLATE_CHALLENGE,
    SELECT_CHALLENGE,
    SPEAK_CHALLENGE,
    TRANSLATE_CHALLENGE
]

let SESSIONS = [
    Session(id: "1", type: "LESSON", challenges: CHALLENGES),
    Session(id: "2", type: "LESSON", challenges: CHALLENGES),
]

let LEVELS = [
    Level(id: 1, name: "My level", type: LevelType.skill, totalSessions: 5, pathLevelMetadata: nil),
    Level(id: 2, name: "My level", type: LevelType.skill, totalSessions: 5, pathLevelMetadata: nil),
]

let UNITS = [
    Unit(id: 1, name: "My unit", levels: LEVELS),
    Unit(id: 2, name: "My unit", levels: LEVELS),
]

let EXAMPLE_SENTENCE = Section.ExampleSentence(exampleSentence: "Example Sentence")

let SECTIONS = [
    Section(id: 0, name: "FIrst section", type: SectionType.learning, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 3, name: "FIrst section", type: SectionType.personalizedPractice, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
    Section(id: 6, name: "FIrst section", type: SectionType.dailyRefresh, units: UNITS, exampleSentence: EXAMPLE_SENTENCE),
]

let COURSES = [
    Course(id: "1", fromLanguage: "pt", learningLanguage: "fr", sections: SECTIONS),
    Course(id: "2", fromLanguage: "pt", learningLanguage: "fr", sections: SECTIONS)
]

let AVAILABLE_COURSES = [
    AvailableCourse(fromLanguage: "pt", fromLanguageName: "Português", learningLanguage: "es", learningLanguageName: "Espanhol", numLearners: 1000),
]
