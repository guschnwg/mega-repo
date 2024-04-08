// deno-lint-ignore-file prefer-const
const filePath = Deno.args[0];
const outputFilePath = Deno.args[1];

if (!filePath || !outputFilePath) {
  console.error("Usage: deno run --allow-read --allow-write convert.js <input-file> <output-file>");
  Deno.exit(1);
}

const file = JSON.parse(await Deno.readTextFile(filePath));

const course = {
  id: file["id"],
  fromLanguage: file["fromLanguage"],
  learningLanguage: file["learningLanguage"],
  numberOfWords: file["numberOfWords"],
  numberOfSentences: file["numberOfSentences"],
  sections: file["pathSectioned"].map((section, sectionIdx) => {
    return {
      id: section["index"],
      name: section["debugName"],
      type: section["type"],
      totalUnits: section["totalUnits"],
      summary: section["summary"],
      exampleSentence: section["exampleSentence"],
      units: section["units"].map((unit, unitIdx) => {
        return {
          id: unit["unitIndex"],
          name: unit["teachingObjective"] || "",
          levels: unit["levels"].map((level, levelIdx) => {
            let sessions = [];

            let basePath = `./courses/${file["id"]}/${sectionIdx}/${unitIdx}/${levelIdx}`;
            for (const dirEntry of Deno.readDirSync(basePath)) {
              if (dirEntry.name === "chest") continue;

              let sessionFile = JSON.parse(
                Deno.readTextFileSync(basePath + "/" + dirEntry.name)
              );
              sessions.push({
                id: sessionFile["id"] || "?",
                type: sessionFile["type"] || "?",
                challenges: (sessionFile["challenges"] || []).map((challenge) => {
                  return {
                    id: challenge["id"],
                    type: challenge["type"],
                    data: challenge,
                    rawData: JSON.stringify(challenge),
                  };
                }),
              });
            }

            return {
              id: level["id"],
              name: level["debugName"],
              objective: level["pathLevelClientData"]["teachingObjective"],
              type: level["type"],
              subtype: level["subtype"],
              totalSessions: level["totalSessions"],
              sessions: sessions,
            };
          })
        }
      })
    }
  })
}

Deno.writeTextFile(
  outputFilePath,
  JSON.stringify(course, null, 2)
);