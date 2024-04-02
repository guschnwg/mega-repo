// deno-lint-ignore-file prefer-const

const outputPath = Deno.args[0];
const fromLanguage = Deno.args[1];
const learningLanguage = Deno.args[2];
const token = Deno.args[3];

if (!outputPath || !fromLanguage || !learningLanguage || !token) {
    console.error(
        "Usage: deno run --allow-net --allow-write --allow-read fetch.js <outputPath> <fromLanguage> <learningLanguage> <token>"
    );
    Deno.exit(1);
}

const headers = {
    "accept": "application/json; charset=UTF-8",
    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": "Bearer " + token,
    "content-type": "application/json; charset=UTF-8",
};

const challengeTypes = [
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

async function getCourse() {
    let fields = 'acquisitionSurveyReason,adsConfig,animationEnabled,betaStatus,blockedUserIds,blockerUserIds,canUseModerationTools,classroomLeaderboardsEnabled,courses,creationDate,currentCourseId,email,emailAnnouncement,emailAssignment,emailAssignmentComplete,emailClassroomJoin,emailClassroomLeave,emailEditSuggested,emailEventsDigest,emailFollow,emailPass,emailPromotion,emailResearch,emailWeeklyProgressReport,emailSchoolsAnnouncement,emailSchoolsNewsletter,emailSchoolsProductUpdate,emailSchoolsPromotion,emailStreamPost,emailVerified,emailWeeklyReport,enableMicrophone,enableSoundEffects,enableSpeaker,experiments%7Bconnect_friends_quests_gifting_2,connect_web_migrate_to_feed_service,designsys_web_redesign_settings_page,gweb_avatar_builder,gweb_avatar_builder_v2,gweb_diamond_tournament_dogfooding,mcoach_family_weekly_report_dev,mcoach_web_ph_copysolidate,mcoach_web_words_list,mcoach_web_words_list_remove_promo,minfra_web_stripe_setup_intent,nurr_web_daily_goal_cta,path_web_course_complete_slides,path_web_daily_refresh_animation,path_web_example_sentences,path_web_example_sentences_with_transliterations,path_web_latin_example_sentences,path_web_persistent_headers_redesign,path_web_sections_overview,path_web_speaking_toggle_removal,spack_new_years_2024_dark_packages,spack_new_years_2024_discount_explain,spack_new_years_2024_fab_animation,spack_new_years_2024_last_chance,spack_new_years_2024_new_hooks,spack_new_years_2024_purchase_flow_port,spack_new_years_2024_show_family_plan,spack_web_copysolidate_conv,spack_web_copysolidate_dash_super,spack_web_copysolidate_quit,spack_web_new_years_2024_vid_ad_load,spack_web_super_promo_d12_pf2,spack_web_upgrade_flow,tsl_web_tournament_fetch_data,use_new_hint_tokenization_ja_en_web_v2,web_hintable_text_rewrite_v3,writing_web_pinyin_hanzi,writing_web_pronunciation_bingo%7D,facebookId,fromLanguage,gemsConfig,globalAmbassadorStatus,googleId,hasFacebookId,hasGoogleId,hasPlus,health,id,inviteURL,joinedClassroomIds,lastResurrectionTimestamp,lastStreak%7BisAvailableForRepair,length%7D,learningLanguage,lingots,location,monthlyXp,name,observedClassroomIds,optionalFeatures,persistentNotifications,picture,plusDiscounts,practiceReminderSettings,privacySettings,referralInfo,rewardBundles,roles,sessionCount,streak,streakData%7BcurrentStreak,longestStreak,previousStreak%7D,timezone,timezoneOffset,totalXp,trackingProperties,username,webNotificationIds,weeklyXp,xpGains,xpGoal,zhTw,currentCourse';
    let res = await fetch("https://www.duolingo.com/2017-06-30/users/134244220?fields=" + fields, {
        "headers": headers,
        "method": "GET",
    });
    let data = await res.json();

    let course = data.currentCourse;

    return course;
}

async function getSpecificCourse(fromLanguage = 'pt', learningLanguage = 'es') {
    let fields = 'courses,currentCourse,fromLanguage,learningLanguage';
    let res = await fetch("https://www.duolingo.com/2017-06-30/users/134244220?fields=" + fields, {
        "headers": headers,
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

async function getSessions(fromLanguage, learningLanguage, level) {
    let sessions = [];
    for (let i = 0; i < level.totalSessions; i++) {
        let session = await getSession(fromLanguage, learningLanguage, level, i);
        if (!session) {
            console.error(`Failed to get session for ${sectionIdx}.${unitIdx}.${levelIdx}`);
            continue;
        }
        sessions.push(session);
    }
    return sessions;
}

async function getSession(fromLanguage, learningLanguage, level, levelSessionIndex = 0, retry = true) {
    let postData = {
        "challengeTypes": challengeTypes,
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
        "headers": headers,
        "body": JSON.stringify(postData),
        "method": "POST",
    });
    if (res.ok) {
        let data = await res.json();
        return data;
    }

    if (retry) {
        return getSession(fromLanguage, learningLanguage, level, levelSessionIndex, false);
    }

    return { id: "FAILED." + levelSessionIndex, data: postData };
}

async function getStory(storyId) {
    let qs = "?crowns=29&debugShowAllChallenges=false&illustrationFormat=svg&isDesktop=true&isLegendaryMode=false";
    qs += "&masterVersion=false&mode=READ";
    qs += "&supportedElements=ARRANGE,CHALLENGE_PROMPT,DUO_POPUP,FREEFORM_WRITING,FREEFORM_WRITING_EXAMPLE_RESPONSE,FREEFORM_WRITING_PROMPT,HEADER,HINT_ONBOARDING,LINE,MATCH,MULTIPLE_CHOICE,POINT_TO_PHRASE,SECTION_HEADER,SELECT_PHRASE,SENDER_RECEIVER,SUBHEADING,TYPE_TEXT";
    qs += "&type=story&_=1711454331093";

    let res = await fetch("https://stories.duolingo.com/api2/stories/" + storyId + qs, {
        "headers": headers,
        "method": "GET",
    });

    if (res.ok) {
        let data = await res.json();
        return data;
    }
}

async function dumpSessionForAllLessonsInCourse(fromLanguage, learningLanguage) {
    let course = await getSpecificCourse(fromLanguage, learningLanguage);

    let encoder = new TextEncoder();
    let data = encoder.encode(JSON.stringify(course, null, 2));
    await Deno.mkdir(outputPath, { recursive: true });
    await Deno.writeFile(`${outputPath}/${course.id}.json`, data);

    for (let sectionIdx in course.pathSectioned) {
        let section = course.pathSectioned[sectionIdx];

        for (let unitIdx in section.units) {
            let unit = section.units[unitIdx];

            for (let levelIdx in unit.levels) {
                let level = unit.levels[levelIdx];

                console.log(`${sectionIdx}/${unitIdx}/${levelIdx}`);
                await Deno.mkdir(`${outputPath}/${course.id}/${sectionIdx}/${unitIdx}/${levelIdx}`, { recursive: true });

                if (['unit_review', 'skill', 'practice'].includes(level.type)) {
                    let sessions = await getSessions(
                        course.fromLanguage,
                        course.learningLanguage,
                        level,
                    );

                    for (let session of sessions) {
                        // Write to file
                        let encoder = new TextEncoder();
                        let data = encoder.encode(JSON.stringify(session, null, 2));
                        await Deno.writeFile(
                            `${outputPath}/${course.id}/${sectionIdx}/${unitIdx}/${levelIdx}/${session.id}.json`,
                            data,
                        );
                    }

                } else if (level.type === 'story') {
                    let story = await getStory(level.pathLevelClientData.storyId);
                    if (!story) {
                        console.error(`Failed to get story for ${sectionIdx}.${unitIdx}.${levelIdx}`);
                        continue;
                    }

                    // Write to file
                    let encoder = new TextEncoder();
                    let data = encoder.encode(JSON.stringify(story, null, 2));
                    await Deno.writeFile(
                        `${outputPath}/${course.id}/${sectionIdx}/${unitIdx}/${levelIdx}/${story.id}.json`,
                        data,
                    );
                } else {
                    console.log("Don't know how to handle " + level.type);

                    let encoder = new TextEncoder();
                    let data = encoder.encode('');
                    await Deno.writeFile(
                        `${outputPath}/${course.id}/${sectionIdx}/${unitIdx}/${levelIdx}/${level.type}`,
                        data,
                    );
                }
            }
        }
    }
}

dumpSessionForAllLessonsInCourse(fromLanguage, learningLanguage);
