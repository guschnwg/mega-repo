// deno-lint-ignore-file prefer-const no-explicit-any

const CHALLENGE_TYPES = [
  "assist",
  "characterIntro",
  "characterMatch",
  "characterPuzzle",
  "characterSelect",
  "characterTrace",
  "characterWrite",
  "completeReverseTranslation",
  "definition",
  "dialogue",
  "extendedMatch",
  "extendedListenMatch",
  "form",
  "freeResponse",
  "gapFill",
  "judge",
  "listen",
  "listenComplete",
  "listenMatch",
  "match",
  "name",
  "listenComprehension",
  "listenIsolation",
  "listenSpeak",
  "listenTap",
  "orderTapComplete",
  "partialListen",
  "partialReverseTranslate",
  "patternTapComplete",
  "radioBinary",
  "radioImageSelect",
  "radioListenMatch",
  "radioListenRecognize",
  "radioSelect",
  "readComprehension",
  "reverseAssist",
  "sameDifferent",
  "select",
  "selectPronunciation",
  "selectTranscription",
  "svgPuzzle",
  "syllableTap",
  "syllableListenTap",
  "speak",
  "tapCloze",
  "tapClozeTable",
  "tapComplete",
  "tapCompleteTable",
  "tapDescribe",
  "translate",
  "transliterate",
  "transliterationAssist",
  "typeCloze",
  "typeClozeTable",
  "typeComplete",
  "typeCompleteTable",
  "writeComprehension"
];

function getHeaders(token: string) {
  return {
    "accept": "application/json; charset=UTF-8",
    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": "Bearer " + token,
    "content-type": "application/json; charset=UTF-8",
  };
}

async function getSpecificCourse(token: string, fromLanguage = 'pt', learningLanguage = 'es') {
  let fields = 'courses,currentCourse,fromLanguage,learningLanguage';
  let res = await fetch("https://www.duolingo.com/2017-06-30/users/134244220?fields=" + fields, {
      "headers": getHeaders(token),
      "body": JSON.stringify(
          {
              "signal": null,
              "fromLanguage": fromLanguage,
              "learningLanguage": learningLanguage
          }
      ),
      "method": "PATCH",
  });

  let data = await res.json();
  let course = data.currentCourse;
  return course;
}

async function getSession(token: string, fromLanguage = 'pt', learningLanguage = 'es', level: any = {}, levelSessionIndex = 0, challengeTypes: string[] = [], retry = true) {
  let postData: any = {
      "challengeTypes": challengeTypes || CHALLENGE_TYPES,
      "fromLanguage": fromLanguage,
      "isFinalLevel": false,
      "isV2": true,
      "juicy": true,
      "learningLanguage": learningLanguage,
      "pathExperiments": [],
      "levelSessionIndex": levelSessionIndex,
  };

  // I don't actually know the precedence of these
  // but some levels have both set
  if (level.pathLevelClientData.skillId) {
      postData.skillId = level.pathLevelClientData.skillId;
  } else if (level.pathLevelClientData.skillIds) {
      postData.skillIds = level.pathLevelClientData.skillIds;
  }

  if (level.type === 'skill') {
      postData.type = "LESSON";
      postData.levelIndex = 0;
      if (level.subtype === 'grammar') {
          postData.isGrammarSkill = true;
      }
  } else if (level.type === 'unit_review') {
      postData.type = "LEXEME_PRACTICE";
      postData.lexemePracticeType = "practice_level";
  } else if (level.type === 'practice') {
      postData.type = "LEXEME_PRACTICE";
      postData.lexemePracticeType = "practice_level";
  } else {
      console.log("Not implemented getSession for " + level.type);
  }

  let res = await fetch("https://www.duolingo.com/2017-06-30/sessions", {
      "headers": getHeaders(token),
      "body": JSON.stringify(postData),
      "method": "POST",
  });
  if (res.ok) {
      let data = await res.json();
      return data;
  }

  if (retry) {
      return getSession(token, fromLanguage, learningLanguage, level, levelSessionIndex, false);
  }

  return { id: "FAILED." + levelSessionIndex, data: postData };
}

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
  const route = new URL(request.url).pathname;
  if (route === "/") {
    return new Response("Hello, world!", { status: 200 });
  }

  if (route === "/ping") {
    return new Response("Pong!", { status: 200 });
  }

  if (route.startsWith("/getSpecificCourse")) {
    const [, , token, fromLanguage, toLanguage] = route.split("/");
    const course = await getSpecificCourse(token, fromLanguage, toLanguage);
    return new Response(JSON.stringify(course, null, 2), { status: 200 });
  }

  if (route.startsWith("/getSession")) {
    const [, , token, fromLanguage, toLanguage, section, unit, level, levelSessionInfo, challengeTypes] = route.split("/");
    const course = await getSpecificCourse(token, fromLanguage, toLanguage);
    const actualLevel = course.pathSectioned[parseInt(section, 10)].units[parseInt(unit, 10)].levels[parseInt(level, 10)];
    const session = await getSession(
      token,
      fromLanguage,
      toLanguage,
      actualLevel,
      parseInt(levelSessionInfo, 10),
      challengeTypes ? challengeTypes.split(',') : [],
    );
    return new Response(JSON.stringify(session, null, 2), { status: 200 });
  }

  const body = `Your user-agent is:\n\n${
    request.headers.get("user-agent") ?? "Unknown"
  }`;

  return new Response(body, { status: 200 });
};

Deno.serve({ port, hostname: '0.0.0.0' }, handler);
