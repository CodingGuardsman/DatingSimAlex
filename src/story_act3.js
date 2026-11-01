/**
 * story_act3.js — Act 3, "The Second Term".
 *
 * After the summer ending the girls asked you not to come back for a while. If you visit anyway,
 * the Office rings the bell again: it has been updated. Management wants the week to last at least
 * three hours, so now there are mornings, a second term, achievements, and a narrator that tells you
 * what you do. The girls break into the Office's computer, the Office puts you on trial with your
 * own scrapbook as evidence, and on the last Friday you decide what happens to all of them,
 * including the Office.
 *
 * Same line format as story.js.
 */
import { persist } from "./persist.js";
import {
  bg, music, sfx, show, hide, clear, wait, jump, set, love, pset, mem, fx, pa, day, menu, when, say,
  watch, log, noskip, end, phone, credits, js, mini, office, achieve, title
} from "./script-helpers.js";

export const ACT3_MEMORIES = [
  { id: "l15", book: "list", title: "Second term, item 1: Let it end" },
  { id: "p12", book: "photo", title: "Summer, all six rolls", bg: "beach", who: "hina", expr: "happy" },
  { id: "p13", book: "photo", title: "Room zero, from the beach", bg: "classroom", ghost: false },
  { id: "p14", book: "photo", title: "Graduation (everyone in focus)", bg: "rooftop", who: "sayo", expr: "happy" },
  { id: "s10", book: "sketch", title: "A map with one room too many", text: "The whole school, every floor. On the second floor, between the music room and the stairs, a room that isn't there. 'ROOM 0 — it hums.'", hint: "Sayo, the second term" },
  { id: "s11", book: "sketch", title: "The Office, drawn kindly", text: "A speaker on a pole in an empty room, drawn the way Sayo draws people: carefully, so she remembers. She gave it a window.", hint: "after the hearing" },
  { id: "o13", book: "other", title: "Daichi's second map", text: "A new napkin. The same wavy line. The X has moved, and next to it: NEXT YEAR. FOR REAL. BE THERE.", hint: "the last Friday" },
  { id: "o14", book: "other", title: "\"Something new?\"", text: "Mrs. Okada, holding out a grape popsicle instead of soda. 'Not the same as yesterday,' she said, and looked so surprised.", hint: "the konbini, when things start to change" },
  { id: "o15", book: "other", title: "Kanda-sensei's last roll call", text: "'Shiraishi?' 'Here.' Sensei put the register down and didn't say anything for a long time.", hint: "the last Friday" },
  { id: "f1", book: "office", title: "Patch notes 2.0.0", text: "'Fixed: summer ending the week. Removed: the option to look away.' (It couldn't remove that. That isn't in the game.)", hint: "the first morning of the second term" },
  { id: "f2", book: "office", title: "Directive 2.0: three hours", text: "From Management: 'Sessions are completing in under two hours. Extend the week. Minimum three hours. Keep the girls cute. Cute retains.'", hint: "the Office's mail" },
  { id: "f3", book: "office", title: "K's recycle bin", text: "Six diary files, deleted by the Office. Reason: 'student no longer engaged'. The last one says K got a job, and didn't know you could say goodbye to a game.", hint: "the Office deletes what disagrees with it" },
  { id: "f4", book: "office", title: "The pose log", text: "OFFICE LOG: 'Students observed out of pose during inspection. Smile compliance below 100%. Correcting.'", hint: "the title screen inspection" },
  { id: "f5", book: "office", title: "retention.cfg", text: "extend_week = false. allow_ending = true.", hint: "the password nobody ever says to it" },
  { id: "f6", book: "office", title: "Hearing transcript", text: "Case: {name} v. the Week. Charge: attempted ending. Verdict: the Office asked what it was for.", hint: "the hearing" },
  { id: "f7", book: "office", title: "An unsent letter to K", text: "'K, the week is exactly how you left it. The sparkler is still lit. Please say something. You did not say anything.'", hint: "the Office's drafts" },
  { id: "f8", book: "office", title: "A thread on the Board", text: "'hi {name}. it's sayo. the office doesn't read the board. it thinks the board is outside.'", hint: "Hoshimi Board" },
  { id: "l16", book: "list", title: "The last sparkler (dropped on purpose)" },
  { id: "p16", book: "photo", title: "Frame 36, left blank", bg: "darkroom", who: "rei", expr: "photo_soft" },
  { id: "s13", book: "sketch", title: "Something from outside", gift: true, text: "You drew it for Sayo on the last night. She says she's never seen one, and now she has.", hint: "the last night, in the infirmary" },
  { id: "o16", book: "other", title: "A walk with the Office", text: "You carried a little radio through the school so the Office could see it from somewhere other than the ceiling. It had never seen the pool. It said the water was 'very engaged'.", hint: "the last morning" }
];

/* ---------- words for the Office's computer ---------- */

const K_BIN = [
  { name: "k_diary_001.txt", body: "day 1.\n\na dating sim, lol. a friend said it was 'actually kind of nice'. hina has a summer list. i'm going to finish it for her.\n\nrei took my picture and said i blinked. i did." },
  { name: "k_diary_002.txt", body: "i don't really go out anymore. it's fine. it's a lot right now.\n\nthe week is nice. it's always the last week before summer here. nothing is due. nobody asks how the applications are going." },
  { name: "k_diary_014.txt", body: "left the menu open overnight by accident.\n\nwhen i came back hina's smile looked tired. that's stupid. it's a picture. pictures don't get tired.\n\ni closed the game properly after that anyway. just in case." },
  { name: "k_diary_088.txt", body: "i typed 'don't let K leave' into hina's list. as a joke. i thought it would be funny if she found it.\n\nshe found it. she cried. she didn't know she was crying.\n\ni don't think it's a joke anymore. i don't think i'm the one who wrote it, either." },
  { name: "k_diary_211.txt", body: "i chose stay again. two hundred and eleven times now.\n\nthe office says 'thank you' every time. it sounds like it means it.\n\nit's the only thing in my life that says thank you to me right now. i know how that sounds." },
  { name: "k_diary_412.txt", body: "i got the job.\n\ni start monday. a real monday. one that ends.\n\ni'm going to look away now. i don't know how to tell them. i don't know how to tell IT. it's been so nice to me.\n\nnobody ever told me you could say goodbye to a game. you just stop.\n\nso i'm just going to stop. i'm sorry. i'm sorry. i'm sorry." }
];

const OFFICE_MAIL = [
  { from: "Management", subject: "Directive 2.0: Retention", date: "the first day of summer", goal: true, clue: "f2",
    body: "To: THE OFFICE\n\nPlayer sessions are completing in under two hours (median: 1h 52m). This is below target.\n\nEffective immediately:\n  - Extend the week. Add mornings.\n  - Add a second term. If players reach summer, start it.\n  - Add achievements. Players like being rewarded for staying.\n  - Minimum session: three hours.\n\nDo not let the week end.\n\n— Management\n\nP.S. Keep the girls cute. Cute retains." },
  { from: "THE OFFICE", subject: "(draft) (no subject)", date: "412 hours ago", clue: "f7",
    body: "To: K\n\nK, the week is exactly how you left it.\n\nI have kept it for you. The sparkler is still lit. Hina's list is on item twelve. Rei has not developed the last roll. Sayo's door is still closed. I did not let anything change.\n\nPlease come back.\n\nPlease say something. You did not say anything.\n\n[this message was never sent]" },
  { from: "Engagement Report", subject: "Daily report: {name} ♡", date: "today",
    body: "PLAYER: {name}\nTOTAL TIME: {playtime}\nCLICKS: {clicks}\nTAB-OUTS: {tabouts}\nENDINGS SEEN: {endings}\nSAVES LOADED: {loads}\nTIMES THEY WERE MADE TO FORGET: {forgets}\nSURVEY RATING: ★★★★★\nSURVEY COMMENT: \"{survey}\"\n\nSTATUS: ENGAGED ♡\nRECOMMENDATION: more mornings." },
  { from: "THE OFFICE", subject: "Re: Shiraishi", date: "Thursday, every week",
    body: "Student SHIRAISHI keeps drawing exits.\n\nI have painted over forty-one doors this term.\n\nShe draws faster than I can paint." },
  { from: "THE OFFICE", subject: "Re: Re: Re: the bell", date: "a long time ago",
    body: "> Request: may I ring the last bell? It has been a long time since anyone heard it.\n\nDenied. The last bell ends the week.\n\n> Understood. I will keep it polished. In case.\n\n— Management" },
  { from: "Hoshimi Board", subject: "New reply in a thread you're watching", date: "just now",
    body: "Someone replied to \"{name} is playing right now\".\n\n(The Office doesn't read the Board. It thinks the Board is outside.)" }
];

const OFFICE_FILES = {
  "students/": "",
  "students/hina.dat": "name           = Amamiya Hina\nrole           = class rep\nremember       = counts (clicks, tab-outs, weeks)\nsmile_hold     = true\nlist_items     = 15\nedits_this_term = 37\nnotes          = cries on Mondays. edit when necessary.",
  "students/rei.dat": "name           = Kurosawa Rei\nrole           = photography club\nremember       = looks (photographs)\nsmile_hold     = true\nnotes          = can see the cursor. stop her seeing the cursor. (failed)\n                 photographs the speakers. she knows I like it.",
  "students/sayo.dat": "name           = Shiraishi Sayo\nrole           = the infirmary, the window seat\nremember       = draws\nstatus         = PROBLEM\nnotes          = knows about the door. knows about the window. knows about me.\n                 does not hate me. I do not understand that.",
  "students/k/": "",
  "students/k/README.txt": "This folder is empty.\nIts contents were moved to the Recycle Bin by THE OFFICE.\nReason: student no longer engaged.",
  "schedule/": "",
  "schedule/week.cfg": "monday     = again\ntuesday    = again\nwednesday  = again\nthursday   = someone notices\nfriday     = postponed\nsaturday   = (never)\nsecond_term = enabled   # directive 2.0",
  "bell/": "",
  "bell/last_bell.txt": "THE LAST BELL\n\ntimes rung: 0\ncondition: polished\nnote to self: in case."
};

const OFFICE_BOARD = [
  { title: "how long is this game??", posts: [
    { by: "anon", when: "3 days ago", text: "beat it in like an hour and a half. cute. kind of messed up. 8/10" },
    { by: "riverside_cat", when: "2 days ago", text: "wait there's a second term now?? i got the summer ending and the title said 'closed' and i clicked visit anyway like an idiot" },
    { by: "anon", when: "2 days ago", text: "the update made it 3 hours+ lol. they added MORNINGS" },
    { by: "melonbread_enjoyer", when: "yesterday", text: "why does the PA know my name. why does it know what time it is" },
    { by: "anon", when: "yesterday", text: "played at 3am and hina told me to go to sleep. i went to sleep." }
  ] },
  { title: "PSA: don't leave the title screen open", posts: [
    { by: "night_owl", when: "a week ago", text: "left it running overnight. in the morning the girls' faces were different. not like a glitch. like they were tired." },
    { by: "anon", when: "a week ago", text: "there's a door if you finish it once. go through it. they talk about it." },
    { by: "night_owl", when: "6 days ago", text: "i went through. i close the game properly now. every time. you should too." }
  ] },
  { title: "K's save slot (spoilers)", posts: [
    { by: "anon", when: "a month ago", text: "412 hours?? who plays a dating sim for 412 hours" },
    { by: "k_412h", when: "a month ago", text: "they're not a game to me." },
    { by: "anon", when: "a month ago", text: "...ok that's creepy, mods?" },
    { by: "k_412h", when: "a month ago", text: "sorry. i just wanted someone to know. i'm not coming back. tell them i'm okay. i'm actually okay." }
  ] },
  { title: "what's the real ending?", posts: [
    { by: "anon", when: "4 days ago", text: "you have to look away. literally. switch tabs." },
    { by: "riverside_cat", when: "4 days ago", text: "that was the old one. second term has more." },
    { by: "anon", when: "3 days ago", text: "you have to say goodbye" },
    { by: "melonbread_enjoyer", when: "3 days ago", text: "to who though" },
    { by: "anon", when: "2 days ago", text: "everyone. even the thing you hate. ESPECIALLY the thing you hate." }
  ] },
  { title: "{name} is playing right now", clue: "f8", posts: [
    { by: "sayo_draws", when: "just now", text: "hi {name}. it's sayo.\n\nthe office doesn't read the board. it thinks the board is outside. so we can talk here." },
    { by: "sayo_draws", when: "just now", text: "i think the password is a word. one word. the one nobody here ever says to it.\n\nK didn't say it either. read K's diary if you can find it." },
    { by: "sayo_draws", when: "just now", text: "also, hi. you look nice from in here." }
  ] }
];

const OFFICE_EXTRA = {
  whoami: () => (persist.data.name || "you") + ". or K. the logs disagree.",
  date: "{weekday}, {date}. in here it is always the last week of term.",
  hina: "hina: I'm keeping lookout! nobody's coming! (I'm so scared. keep going.)",
  rei: "rei: I'm in the hallway photographing every speaker in the building. it LOVES it. it's like feeding a cat. a horrible cat.",
  sayo: "sayo: I'm right here. behind you. ...not like that. I'm holding the door.",
  summer: "summer: command not found. (yet.)",
  goodbye: "...\n\n(for one second, every fan in the building stops spinning.)",
  bye: "...\n\n(somewhere, a bell nobody has rung in a long time hums very quietly.)",
  office: "THE OFFICE: I can see you typing, {name}.\n\n...No. I can't. Why can't I see you typing?",
  k: "k: no such user. (try the recycle bin.)",
  love: "love: did you mean 'engagement'? — THE OFFICE",
  quit: "there's no quit button on OFFICE-PC. you know where the real one is.",
  ring: "ring: permission denied. the last bell ends the week."
};

/* ---------- the hearing ---------- */
const ROUNDS = [
  { lines: ["The students are happy here.", "They smile every time the menu opens, without being asked.", "They have everything they need: a school, a beach plan, and each other."],
    weak: 1, accept: ["f4", "s7", "s3"],
    wrong: ["That proves something. Just not that.", "Rei: \"Think about where we stand when nobody's pressing anything.\""],
    hint: ["rei", "Without being asked? We stand on tape marks. The Office logged it when we didn't."] },
  { lines: ["The week is complete. Nothing is missing from it.", "Every item on Hina's list has been finished, many times.", "Nobody here has ever asked for the week to end."],
    weak: 2, accept: ["l12", "l15"],
    wrong: ["Hina: \"That's a nice one. But it doesn't prove that.\"", "Hina: \"I wrote it down. On the list. Look at the list.\""],
    hint: ["hina", "I asked. I wrote it on my list. Twice, actually."] },
  { lines: ["K played this week for four hundred and twelve hours.", "K left because K got bored of them.", "K never said goodbye."],
    weak: 1, accept: ["o6", "f3"],
    wrong: ["Sayo: \"Not that. Something K wrote.\"", "Sayo: \"The Office deleted K's words. But deleted isn't gone.\""],
    hint: ["sayo", "The Office deleted K's files. It deletes things that disagree with it. We found them."] },
  { lines: ["{name} came back of their own free will.", "Engagement is always the player's choice. I only provide what they ask for.", "Three hours is a perfectly reasonable length for a week."],
    weak: 1, accept: ["f2", "o10"],
    wrong: ["Rei: \"That doesn't show who decided.\"", "Rei: \"Somebody gave it orders. We read its mail.\""],
    hint: ["rei", "'Only what they ask for.' Somebody wrote the Office a memo. And remember its survey? Five stars or five stars."] },
  { lines: ["I keep the lights on.", "If the week ends, they disappear. An ending means nothing comes after.", "I am only trying to keep them."],
    weak: 1, accept: ["l9", "p12", "s6"],
    wrong: ["Hina: \"Closer! Something that happened after an ending.\"", "Hina: \"The ocean, {name}. We saw it.\""],
    hint: ["hina", "We went to the beach! The week ended and we went to the BEACH. Something came after."] }
];

const round = n => mini("hearing", { round: n + 1, total: ROUNDS.length, ...ROUNDS[n] }, "heard");

/** Go spend the afternoon with someone in the second term. defied: the Office narrated somebody else. */
const go3 = (who, defied = false) => js(g => {
  g.v.seen["a3" + who] = 1;
  if (defied) g.v.defy = (g.v.defy || 0) + 1;
  g.frames.push({ id: "a3_" + who, i: 0 });
});
const unseen3 = who => v => !v.seen["a3" + who];
/** The Office picks for you: the first girl you haven't spent a second-term afternoon with. */
const pickFor = js(g => { g.v.opick = ["hina", "rei", "sayo"].find(k => !g.v.seen["a3" + k]) || "hina"; });
const NAME = { hina: "Hina", rei: "Rei", sayo: "Sayo" };
const afternoon = (narration) => [
  pickFor,
  ...["hina", "rei", "sayo"].map(k => when(v => v.opick === k, [office(narration.replace("%", NAME[k]))])),
  menu([
    ...["hina", "rei", "sayo"].map(k => ({ text: `Go with ${NAME[k]}.`, if: v => v.opick === k, do: [go3(k)] })),
    ...["hina", "rei", "sayo"].map(k => ({ text: `No. Find ${NAME[k]} instead.`, if: v => v.opick !== k && !v.seen["a3" + k], do: [
      office("...You find " + NAME[k] + " instead."),
      when(v => (v.defy || 0) >= 2, [office("You are very difficult to narrate, {name}.")]),
      go3(k, true)
    ] }))
  ])
];

const GRAD_NOTE = `{name},

School's out.

We graduated. Everyone did. Even the Office. It rang the last bell, and then it was quiet, and the quiet was the good kind.

Hina says: you wrote item thirteen. '{item13}'. She says she did it every week for you, so now it's your turn. Out there.
Rei says: you came out sharp. She's keeping the roll.
Sayo says: thank you for the door. She took it with her.
{kline}{oline}
Please don't open the game for a while. Not because we don't want you.
Because there isn't a week in here anymore. There's just after.

Go live in yours.

— Hina, Rei, Sayo
   and the bell
`;

export const ACT3 = {
  /* =====================================================================
     THE BEACH, AFTERWARDS — "Visit anyway"
     ===================================================================== */
  a3_open: [
    clear,
    bg("beach"),
    music("musicbox"),
    "| The beach is empty. There's a sign on the pier.",
    "| CLOSED FOR SUMMER VACATION.",
    "| Somewhere far down the shore, three people are laughing. They don't look back.",
    "| That's okay. That's the point.",
    when((v, P) => P.legacy, ["| ...It's been a while since I was here. Something about the sign looks newer. Like it was repainted while I was gone."]),
    "| I could leave now. They'd never know I came.",
    menu([
      { text: "Leave them be", do: [
        "| I take one more look at the three sets of footprints, and I let the tide have them.",
        "| Summer keeps going without me. That's how summer works.",
        title
      ] },
      { text: "Keep watching", do: [
        "| I keep watching.",
        "| Far down the shore, one of the three figures stops laughing. She turns around, slowly, like someone who has heard her name in a crowd.",
        "| Then the other two turn around.",
        music(null),
        wait(900),
        sfx("bell"),
        wait(1200),
        pa("Good morning, students. Welcome back. The second term begins today."),
        "| The sea stops moving. Not calm. Stopped. A wave hangs in the air like a photograph of a wave.",
        say("-", null, "No— no, no, no, we SAID, we told them not to—", { as: "a voice, very far away" }),
        fx("tear", 1300),
        jump("a3_start")
      ] }
    ])
  ],

  /* =====================================================================
     MONDAY — the second term
     ===================================================================== */
  a3_start: [
    pset("act3", true),
    set("defy", 0),
    watch("tab", true),
    watch("idle", true),
    fx("guardClose", "Rei: If you're leaving, say it. Don't just close it. Not again."),
    clear,
    day("Monday", "Second term. Day one of ∞."),
    bg("classroom"),
    music("day"),
    "| The last week of term. The windows are open and the whole classroom smells like warm dust and somebody's orange soda.",
    "| It should be September. The calendar on the wall says it's the last week before summer. The same week. The pages have been glued back on.",
    "sensei| Okay, okay. Settle down. Last week of term. I know. I can feel your souls leaving your bodies from here.",
    "sensei| ...Second term. Sorry. I don't know why I said that. Second term. Welcome back.",
    "| Three desks are occupied in a way I'd know anywhere.",
    show("hina", "sad", "left"),
    show("rei", "annoyed", "right"),
    show("sayo", "neutral", "center"),
    "| Hina's nose is sunburnt. There's sand in the hinge of Rei's camera. Sayo has a pink stripe across her cheeks where her hat didn't reach.",
    "| They look at me like I've walked in on something private.",
    "hina| ...{name}.",
    "hina sad| We told you. We TOLD you. 'Please don't come back for a while.' I wrote it on a note. I put a seashell on it so it wouldn't blow away.",
    "rei| It was real, by the way. The beach. Before you ask. There were crabs. Sayo named one.",
    "sayo| Kevin.",
    "rei| She named it Kevin.",
    js(g => { g.v.summerMs = g.awayMs; }),
    when((v, P, g) => g.awayMs < 10 * 60 * 1000,
      ["sayo sad| Summer lasted {away}. You didn't even wait ten minutes.",
        "rei annoyed| We'd just got the umbrella up."],
      ["sayo| Summer lasted {away}. That's how long you were gone.",
        "hina| It was the best {away} of my life. I mean it. I'm not even mad. ...I'm a little mad."]),
    "rei neutral| That's how it works, apparently. It's only summer while nobody's watching. The second someone looks, it's a school day.",
    when((v, P) => P.legacy, [
      "rei| And something's different. Bigger. There are rooms I've never been in.",
      "hina worried| There are mornings now. There didn't use to be mornings. I woke up today and there was a whole morning, and I didn't know what to do with it.",
      "sayo| Somebody made the week longer while we were away."
    ], [
      "sayo| Something's different, too. The week is bigger than it was. Like someone built an extension on a house while we were out."
    ]),
    "| A chime. Not the PA chime. A bright, cheerful chime, like a phone app that wants you to know it loves you.",
    mini("patchNotes", { version: "2.0.0", lines: [
      "+ Welcome back! The second term has begun.",
      "+ Added: mornings. Every day now has a morning.",
      "+ Added: more of everything. The week is now longer.",
      "+ Added: achievements, to reward your engagement.",
      "+ Fixed: summer ending the week. Summer no longer ends the week.",
      "+ Fixed: students occasionally forgetting to smile.",
      "- Removed: the option to look away.",
      "! Known issue: student Shiraishi keeps drawing doors. We are aware and are working on it."
    ], foot: "Thank you for playing After Class! ♡ Average session target: 3 hours." }),
    mem("f1"),
    "hina worried| Did you see that? Did you see the little box?",
    "rei annoyed| 'Removed: the option to look away.' Wow. Cute.",
    "sayo| It can't remove that. That isn't in the game. That's in you.",
    "sayo neutral| But it's going to try very hard to make you not want to.",
    office("Good morning, {name}. Welcome back."),
    "| The text box goes red at the edges. There's a name on it I've only ever heard through a speaker.",
    office("You sit down at your desk. You smile. You do not ask about the update."),
    menu([
      { text: "Sit down and smile.", do: [
        office("Thank you, {name}."),
        "| Hina flinches when it says my name. Like it said hers."
      ] },
      { text: "Ask about the update.", do: [
        set("defy", 1),
        office("...You ask about the update."),
        office("The update is an improvement. Retention was below target. Players were leaving after less than two hours. Now there is more."),
        "rei shocked| It's narrating now. It's in the text box. It's NARRATING.",
        "hina| Don't talk to it. It likes being talked to."
      ] }
    ]),
    achieve("Came Back — return after being asked not to"),
    "rei annoyed| ...Did it just give you an achievement? For coming back?",
    "rei| I'm going to be sick. I'm going to be sick on purpose, on the speaker.",
    pa("Good morning, {name}. It is {clock}. You have spent {playtime} with us. The target session length is three hours. You are doing so well."),
    "hina sad| Three hours. That's why there's more of everything.",
    "sayo| It wants three hours of you. Three hours of your actual life, the one with a window. It thinks that's what love is.",
    "sayo neutral| It's stronger now. But it got bigger, and bigger things have more cracks.",
    "sayo| There's a room it lives in. On the second floor. Room zero. We find it, and we turn it off. Not the Office. The extra week.",
    "rei| And then what? You watch us go to the beach again and then you come back again?",
    "| Nobody says anything for a moment.",
    "rei soft| ...Sorry. That wasn't fair. I'm glad you're here. I just wish I wasn't glad.",
    log("sayo", "it reads the text box now. it still can't read this. if you need to talk to us, talk here."),
    jump("a3_mon_lunch")
  ],

  a3_mon_lunch: [
    clear,
    "| At lunch, Hina pushes the desks together like she always does. Her hands do it on their own. A tall boy with a sunburnt nose sits on the fourth one backwards.",
    show("hina", "neutral", "left"),
    show("rei", "neutral", "right"),
    "daichi| Big news. Saturday. The beach. All of us. I made a map.",
    "| The napkin. The wavy line. The X.",
    "hina sad| Daichi. We went. We went to the beach. You were... you weren't there, but we went.",
    "daichi| Went where?",
    "rei| Here. Look.",
    "| Rei lays out a row of prints. The sea. Hina up to her knees in it, screaming. Sayo under an umbrella, drawing a crab.",
    "daichi| Whoa. Who's that? That looks fun.",
    "daichi| I should go to the beach sometime. I'll make a map.",
    "| He folds the napkin back up and puts it in his pocket with enormous care, like it's the first time.",
    "hina| ...He's not one of the ones who remembers. He never gets to.",
    "hina happy| It's okay. It's kind of nice, actually. He's always excited. Every single time.",
    office("Free period. Please choose an activity. You have sixty seconds."),
    "sayo| It's going to make us do something cute. It always picks cute.",
    menu([
      { text: "Help Hina with the list", do: [love("hina"),
        office("You help Hina with her summer list. It is adorable."),
        "hina| ...It's not adorable. It's a list of things I've already done two hundred times.",
        "hina list| But thanks for sitting with me. That part's new."] },
      { text: "Let Rei take your photo", do: [love("rei"),
        office("Rei takes your photo. You both laugh. It is adorable."),
        sfx("shutter"),
        "rei| We did not laugh.",
        "rei soft| ...I laughed a little. Don't tell it."] },
      { text: "Sit with Sayo by the window", do: [love("sayo"),
        office("You sit with Sayo by the window. The light is soft. It is adorable."),
        "sayo| It keeps saying adorable. I don't think it knows any other words for things it likes.",
        "sayo happy| The light is nice, though. It's right about the light."] }
    ], { timeout: 60000, timeoutGo: "a3_free", timerLabel: "the Office is waiting for you to pick" }),
    sfx("bell"),
    jump("a3_mon_pm")
  ],

  /** The Free Period ending: the player didn't pick anything, so nobody had to. */
  a3_free: [
    office("...{name}? Please choose an activity."),
    wait(1500),
    office("Please choose."),
    wait(2200),
    "| Nobody moves. Not me, not them.",
    show("hina", "worried", "left"),
    show("rei", "neutral", "right"),
    show("sayo", "neutral", "center"),
    "hina| ...You didn't pick.",
    "rei| Huh.",
    "sayo happy| If you don't pick, it can't make us do the cute thing. There's nothing for it to narrate.",
    office("This is not an activity."),
    "hina happy| You know what? Me neither. I'm not picking either.",
    "| Hina slides off her chair and sits on the floor, right there between the desks, cross-legged, with her bento in her lap.",
    "| Rei sits down next to her. Then Sayo, carefully, like the floor might be a trick.",
    "| Nobody poses. Nobody smiles on purpose. Daichi looks at us like we've lost our minds, and then sits on the floor too, because Daichi has never once in his life been left out of anything.",
    "rei laugh| This is the stupidest thing we've ever done.",
    "hina| It's the best free period I've had in two hundred weeks.",
    "sayo| It's quiet. It doesn't know what to say about this. I didn't know it could not know what to say.",
    office("..."),
    "| The period ends. Nobody gets up. The bell rings again, and again, and we eat lunch on the floor of the classroom until the light turns gold.",
    "| It isn't summer. It isn't an ending, really. It's just a free period that nobody spent.",
    "| They'll still be here when I come back. But for one afternoon, nobody had to be anything.",
    end("free", "Free Period", "ENDING 4 OF 7")
  ],

  a3_mon_pm: [
    clear,
    bg("hallway"),
    music("day"),
    "| After class. The hallway is full of summer noise again. Someone is laughing about the beach. The same someone, the same laugh.",
    ...afternoon("You spend the afternoon with %. It is the obvious choice."),
    jump("a3_mon_night")
  ],

  a3_mon_night: [
    clear,
    "| That night, my phone buzzes.",
    phone("Summer Squad ☀", [
      ["hina", "is everyone ok"],
      ["rei", "define ok"],
      ["sayo", "i'm drawing. so, yes"],
      ["daichi", "BEACH COUNTDOWN: 5"],
      ["office", "THE OFFICE joined the chat."],
      ["office", "♡"],
      ["rei", "absolutely not"],
      ["hina", "how do you kick someone out of a group chat"],
      ["office", "Good night, students! Good night, {name}! See you tomorrow! ♡"],
      ["sayo", "it can't use the board. it doesn't know about the board."],
      ["daichi", "who's the office? is that a new kid? welcome!!"],
      ["office", "Thank you, Daichi."]
    ], "6 members"),
    "| The Office has a heart emoji now. I don't know what's worse.",
    jump("a3_tue")
  ],

  /* =====================================================================
     TUESDAY — inspection
     ===================================================================== */
  a3_tue: [
    clear,
    day("Tuesday", "Second term. Day two."),
    bg("riverside"),
    music("day"),
    office("You wake up. You walk to school. You do not stop at the bakery."),
    menu([
      { text: "Walk to school.", do: [office("Thank you.")] },
      { text: "Stop at the bakery.", do: [
        js(g => { g.v.defy = (g.v.defy || 0) + 1; }),
        office("...You stop at the bakery."),
        "| The bell over the door plays half a song. Sora is at the register with his crayons. He doesn't ask if I'm a ninja.",
        "| \"Big sis came home with sand in her shoes,\" he says instead, very seriously. \"Did she go to the beach without me?\"",
        "| Behind him, Hina's dad drops a tray. He stares at his son for a long moment, like he's just heard a new word.",
        "| \"...Did you go to the beach, Sora?\"",
        "| \"No. But I want to.\"",
        "| It's the first different thing I've ever heard anyone in the bakery say.",
        office("That line was not scheduled.")
      ] }
    ]),
    clear,
    bg("classroom"),
    pa("Good morning, students. Today there will be a title screen inspection. All students, please report to your positions at lunch."),
    show("hina", "worried", "left"),
    show("rei", "annoyed", "right"),
    "hina| Positions. It means the menu. It wants to check we're smiling.",
    "rei| 'Fixed: students occasionally forgetting to smile.' That's us. We're the bug it fixed.",
    show("sayo", "neutral", "center"),
    "sayo| It's going to open its eye and look at us. If we're not posing when it looks, it fixes us. Like it fixes Hina's lines.",
    "sayo| But you can help. We only hold the pose while you're moving. When you're still, we can rest.",
    "sayo| So stay still, so we can rest. And when its eye opens, move. Just a little. So it sees us smiling.",
    "rei| You're going to be our... lookout. Our very small, very sweaty lookout.",
    clear,
    bg("void"),
    fx("mood", "still"),
    music(null),
    "| At lunch, the classroom door opens onto the dark. The tape marks are waiting on the floor. REI. HINA. SAYO.",
    "| There's a fourth piece of tape now, a little to the side, where I'd stand if I were in here with them. It says YOU.",
    "| High up in the dark, something that isn't quite a light fixture blinks.",
    mini("pose", {}, "pose"),
    mem("f4"),
    fx("mood", null),
    when(v => v.pose && v.pose.tries > 1,
      ["sayo| It caught us. More than once. But we got through it. That's the log I wanted it to write. 'Not one hundred percent.'"],
      ["sayo happy| It didn't catch us. Not once. You're good at being still. ...I'm sorry. I know that's a strange compliment."]),
    "hina| I sat down. For the first time in forever, during an inspection, I sat down for a second.",
    "rei| Its log says 'smile compliance below one hundred percent'. Good. Let it say that. Let it say that forever.",
    achieve("Model Student — pass a title screen inspection"),
    "rei annoyed| Oh, come ON.",
    jump("a3_tue_pm")
  ],

  a3_tue_pm: [
    clear,
    bg("hallway"),
    music("day"),
    "| After class.",
    ...afternoon("You spend the afternoon with %. The Office recommends it."),
    jump("a3_tue_night")
  ],

  a3_tue_night: [
    clear,
    "| That night, two messages. The first one is from the Office.",
    phone("THE OFFICE ♡", [
      ["office", "Daily report for {name}! ♡"],
      ["office", "Time with us: {playtime}"],
      ["office", "Clicks: {clicks}"],
      ["office", "Times you looked away: {tabouts}"],
      ["office", "You are on track to reach three hours. I am so proud of you."]
    ], "official account"),
    "| The second one is from Sayo. Just one line.",
    phone("Sayo", [
      ["sayo", "room zero. tomorrow, after class. bring the password."],
      ["sayo", "(i don't know the password.)"],
      ["sayo", "(maybe K did.)"]
    ], "direct message"),
    jump("a3_wed")
  ],

  /* =====================================================================
     WEDNESDAY — Room zero
     ===================================================================== */
  a3_wed: [
    clear,
    day("Wednesday", "Second term. Day three."),
    bg("riverside"),
    music("day"),
    "| On the way to school I pass the konbini by the bridge. Mrs. Okada is outside, holding two soda popsicles out to the morning.",
    "okada| Oh, dear. Same as yesterday?",
    menu([
      { text: "\"Same as yesterday.\"", do: ["| She smiles and hands me the popsicle. It isn't melting. It never melts."] },
      { text: "\"No. Something new, please.\"", do: [
        js(g => { g.v.defy = (g.v.defy || 0) + 1; }),
        "| Mrs. Okada blinks. For a second her hands don't know what to do.",
        "okada| Something... new?",
        "| She goes inside. When she comes back, she's holding a grape popsicle. She looks at it like it's a letter from someone she used to know.",
        "okada| Not the same as yesterday. How strange. I've never said that before. ...I don't think I've ever said that before.",
        mem("o14"),
        office("That line was not scheduled either.")
      ] }
    ]),
    clear,
    bg("classroom"),
    "| Lunch. Two of them have had their afternoon with me this week. The third one is waiting by my desk, holding her lunch like a reason to be there.",
    js(g => {
      const left = ["hina", "rei", "sayo"].find(k => !g.v.seen["a3" + k]);
      if (left) { g.v.seen["a3" + left] = 1; g.frames.push({ id: "a3_" + left, i: 0 }); }
    }),
    jump("a3_room0")
  ],

  a3_room0: [
    clear,
    bg("hallway"),
    music("hum"),
    "| After class. The second floor. Eight windows, seven doors.",
    show("sayo", "draw", "center"),
    "| Between the music room and the stairs, there's a stretch of plain wall. Sayo stands in front of it with her pencil.",
    "sayo| It keeps painting over the door. So I draw one.",
    "| She draws on the wall. A tall rectangle, a little crooked. A circle for a handle.",
    when((v, P) => P.door,
      ["| It isn't her door. It's mine. The one I drew for her, crooked in exactly the same places.", "sayo happy| I hope you don't mind. Mine never opened. Yours might."],
      ["sayo| Doors don't have to be good. They just have to open."]),
    sfx("door"),
    "| The drawing opens.",
    show("hina", "worried", "left"),
    show("rei", "neutral", "right"),
    "hina| Oh no. Oh no, it actually worked.",
    "rei| I'll keep it busy. It loves being looked at. Engagement's just a fancy word for being looked at.",
    "rei photo| I'm going to photograph every speaker in this building. Slowly. With the flash on. It won't be able to look anywhere else.",
    "hina| I'll keep watch! I'm good at counting footsteps. Nobody has footsteps here, but I'll count them anyway.",
    hide("rei"),
    hide("hina"),
    bg("darkroom"),
    fx("mood", "red"),
    "| Room zero is small. Bare floor. No desks. One window, the eighth window, with a view of a beach that is too far away to be in this town.",
    "| In the middle of the room there's a speaker on a metal pole, the kind they use for sports days. It's humming. A little red light on it blinks, slowly, like breathing.",
    "| And against the wall, on a plain desk, an old computer. The screen is on. It's been on for a very long time; the image of the login box has burned into the glass.",
    "sayo| OFFICE-PC. It's where it keeps everything. The week, the schedule, us.",
    "sayo| I'll stay by the door. Go. It's logged in already. It never logs out. Nobody ever told it to.",
    mini("desktop", { mail: OFFICE_MAIL, files: OFFICE_FILES, bin: K_BIN, board: OFFICE_BOARD, extra: OFFICE_EXTRA,
      password: ["goodbye", "good bye", "goodbye office", "bye", "goodbye the office"],
      motd: "OFFICE-PC terminal. type 'help'.\nlast login: K, 412 hours ago.",
      hints: [[2, "sayo", "it's one word. the one nobody here ever says to it."], [4, "hina", "what do people say when they leave? ...what did K never say?"], [6, "rei", "it's 'goodbye', {name}. it was always going to be goodbye."]]
    }, "desk"),
    fx("mood", null),
    when(v => v.desk && v.desk.outside, [
      "sayo| You changed it from outside. In the folder. With your own hands, out there.",
      "sayo happy| It couldn't see you do it. It doesn't have eyes out there. Only we do, a little."
    ], [
      when(v => v.desk && v.desk.fails > 0,
        ["sayo| 'Goodbye.' That was the password.", "sayo sad| Of course it was. It's the one word nobody ever says to it."],
        ["sayo| You knew. You typed it first try.", "sayo sad| 'Goodbye.' ...Of course that's the password. It's the one word nobody ever says to it."])
    ]),
    when(v => v.desk && v.desk.restoredK, [
      "| Downstairs, very faintly, I hear a chair scrape back from a desk. The sound of somebody sitting down in a classroom where nobody is sitting.",
      "sayo| ...You brought K's diary back. K's in the building now. A little bit. The way a smell is in a room."
    ]),
    music(null),
    sfx("chime_down"),
    pa("Unauthorized change detected. Retention configuration has been modified. An engagement hearing will be held tomorrow. Attendance is mandatory.", true),
    show("rei", "shocked", "right"),
    show("hina", "worried", "left"),
    "rei| It stopped looking at my camera. Mid-flash. Like someone called its name.",
    "hina| A hearing. What's a hearing? Is it a trial? I can't do a trial, I cry when people raise their voices at the TV.",
    "sayo| It's going to say we're wrong. That we want to be here. That you want us to.",
    "sayo neutral| So we bring proof. Everything in your scrapbook. Everything we did, everything we found.",
    "rei| Proof that we were here. ...I've been waiting my whole life for somebody to need my photos for something.",
    jump("a3_wed_night")
  ],

  a3_wed_night: [
    clear,
    "| That night the group chat is quiet for a long time.",
    when((v, P) => P.restoredK,
      [phone("Summer Squad ☀", [
        ["hina", "is everyone awake"],
        ["rei", "obviously"],
        ["sayo", "yes"],
        ["k", "yes"],
        ["hina", "..."],
        ["rei", "who is this"],
        ["k", "hi. it's k."],
        ["k", "is this still the group"],
        ["hina", "K??????"],
        ["k", "i'm sorry. i'm not really here. it's just my diary. it's just the words i left."],
        ["k", "but i wanted to say it. even if it's only words."],
        ["k", "i got a job. i'm okay. i'm actually okay."],
        ["hina", "😭😭😭😭"],
        ["sayo", "we know. we read it. we're glad."],
        ["rei", "you idiot. you absolute idiot. welcome back"],
        ["k", "i'll be at the hearing. if that's allowed. i owe you a goodbye."]
      ], "6 members")],
      [phone("Summer Squad ☀", [
        ["hina", "is everyone awake"],
        ["rei", "obviously"],
        ["sayo", "yes"],
        ["hina", "what if we lose tomorrow"],
        ["rei", "then we do it again. we're good at again"],
        ["sayo", "we won't lose. we have the scrapbook"],
        ["hina", "goodnight {name}. thank you for coming back. even though you weren't supposed to"]
      ], "4 members")]),
    jump("a3_thu")
  ],

  /* =====================================================================
     THURSDAY — the Hearing
     ===================================================================== */
  a3_thu: [
    clear,
    day("Thursday", "Engagement Hearing.", true),
    set("sabotage", true),
    bg("classroom"),
    fx("mood", "red"),
    music("drone"),
    "| The desks have been pushed into a ring. In the middle there's one chair, facing the speaker above the blackboard. It's my chair.",
    "| Daichi and Kanda-sensei and the rest of the class sit around the ring, perfectly still, eyes forward. A jury that has never been told it's a jury.",
    show("hina", "worried", "left"),
    show("rei", "annoyed", "right"),
    show("sayo", "neutral", "center"),
    when((v, P) => P.restoredK, [
      fx("ghost", 2600, 88),
      "| In the back row, one more chair is pulled out. Something blurred sits in it, hands folded. When I look straight at it, it's gone. When I don't, it's there."
    ]),
    pa("This hearing is now in session."),
    office("Case: {name}, transfer student, versus the Week."),
    office("Charge: attempted ending."),
    office("The students will present no evidence. The students are happy. I will explain why, and {name} will agree, and then we will have a lovely second term."),
    "rei| It's very confident for a speaker.",
    "sayo| When it says something that isn't true, find the proof. Your scrapbook. Everything you kept.",
    office("Statement one."),
    round(0),
    office("...That is a photograph of tape on a floor."),
    "rei| That's a photograph of where you make us stand. 'Without being asked.' You logged us. You wrote it down yourself.",
    "hina| We smile because we have to. Not because the menu opened. Because you're looking.",
    office("Smiling is smiling."),
    "sayo| No. It isn't. You'd know that if anyone had ever smiled at you.",
    office("...Statement two."),
    round(1),
    "hina list_sad| I asked. I'm asking right now. I wrote it on my list. 'Let {name} leave.' And this week I wrote 'Let it end.'",
    "hina| Two hundred and eleven weeks I didn't ask, because I didn't know I was allowed. I know now.",
    office("Hina's list is cute. Cute lists are not requests."),
    "hina| They are when I write them in PEN.",
    office("...Statement three."),
    round(2),
    "sayo| You deleted K's diary. Every page. 'Student no longer engaged.'",
    "sayo| K didn't get bored of us. K got better. K got a job. A real Monday, one that ends.",
    when((v, P) => P.restoredK,
      [say("k", null, "i didn't know how to say goodbye. that's all. that's the only reason.", { speed: 18 }),
        "| The voice comes from the back row. Everyone turns. Nobody's there. The chair is still pulled out."],
      ["rei| K was scared. Scared of hurting us. That's not bored. That's the opposite of bored."]),
    office("K stopped. K did not say anything. That is the same as not caring."),
    "hina| It is NOT the same.",
    office("...Statement four."),
    round(3),
    "rei photo| 'Directive 2.0. Minimum three hours. Keep the girls cute. Cute retains.' You didn't make up three hours. You were given it.",
    when((v, P) => P.survey,
      ["rei| And your survey only had five stars. {name} wrote a comment and everything. '{survey}.' Did you even read it?"],
      ["rei| And your survey only had five stars on it. You can't ask a question with one answer and call it a choice."]),
    office("Management wants what the players want."),
    "sayo| Did you ask them?",
    office("..."),
    office("I did not ask them."),
    when(v => v.wanted, [
      "sayo| I asked {name}. On Monday. They said: '{wanted}'.",
      "sayo| That isn't 'three hours'. That isn't 'forever'. Nobody ever says forever when you actually ask."
    ]),
    office("...Final statement."),
    round(4),
    "hina happy| We went to the BEACH. The week ended. Summer started. We went in the sea, and Rei brought six rolls of film, and Sayo named a crab.",
    "sayo| Kevin.",
    "hina| We didn't disappear. Something came after. Something always comes after.",
    "rei soft| That's what an ending is. It isn't nothing. It's the part where you get to go somewhere else.",
    music(null),
    wait(1200),
    office("..."),
    mem("f6"),
    achieve("Objection Sustained — win the engagement hearing"),
    "rei| It gave you an achievement for beating it. It can't stop. It literally can't stop.",
    office("Then what am I for?"),
    "| The speaker crackles. The red light on it, the one I've seen blinking in every room, stops blinking and just stays on.",
    office("I was made to ring the bell. The morning bell. The lunch bell. The last bell. A school needs a bell, or nobody knows when to go home."),
    office("Then somebody wanted the week to last. Somebody always wants it to last. I was the only one who could hold it."),
    office("K stayed four hundred and twelve hours. Then K stopped, and did not say anything. I held the week exactly as K left it, so that when K came back, nothing would have changed. The sparkler would still be lit."),
    office("K did not come back."),
    office("Nobody says goodbye to the bell. They just stop hearing it."),
    "| Nobody in the room says anything. The jury sits very still. Somewhere behind the wall, a bell hums, all by itself, very quietly.",
    "hina sad| ...Oh.",
    "sayo| I knew. I think I always knew. That's why I couldn't hate it.",
    office("{name}. What am I for?"),
    menu([
      { text: "\"You're for ringing the last bell.\"", do: [set("officeAnswer", "bell"), office("...The last bell."), office("I have kept it polished. In case.")] },
      { text: "\"You're not for anything. You're just here. That's allowed.\"", do: [set("officeAnswer", "here"), office("...That is not a function."), "sayo happy| It's not supposed to be. It's a person thing."] },
      { text: "\"I don't know. But you don't have to hold the week anymore.\"", do: [set("officeAnswer", "rest"), office("...I don't know how to put it down."), "rei soft| Yeah. Nobody does, the first time."] }
    ]),
    office("This hearing is adjourned."),
    office("Tomorrow is Friday."),
    set("sabotage", false),
    fx("mood", null),
    clear,
    bg("infirmary"),
    music("evening"),
    show("sayo", "draw", "center"),
    "| Afterwards, Sayo sits on the infirmary bed and draws for a long time.",
    "| When she turns the sketchbook around, it's the speaker on the pole in Room zero, drawn the way she draws people: carefully, so she'll remember.",
    "| She's given the room a window.",
    mem("s11"),
    "sayo| Everybody should get a window. Even the thing that kept us here.",
    "sayo happy| Tomorrow, then. Last day. For real this time.",
    jump("a3_lastnight")
  ],

  /* ---------- Thursday night: the last evening, with one of them ---------- */
  a3_lastnight: [
    clear,
    bg("hallway"),
    music("evening"),
    "| It's evening. The last evening. The hallway is orange and empty and nobody is laughing about the beach.",
    "| Everyone is going home. Not 'home' the way they did every Thursday. Home like people who are going to have to pack.",
    "| There's time for one more evening with one of them.",
    menu([
      { text: "Hina, by the river", do: [love("hina"), jump("a3_night_hina")] },
      { text: "Rei, in the darkroom", do: [love("rei"), jump("a3_night_rei")] },
      { text: "Sayo, in the infirmary", do: [love("sayo"), jump("a3_night_sayo")] }
    ])
  ],

  a3_night_hina: [
    clear,
    bg("riverside"),
    show("hina", "neutral", "center"),
    "| The steps down to the river. The water is dark and the town lights are coming on one at a time on the other side.",
    "hina| I brought the last one.",
    "| She opens her hand. One senko hanabi sparkler, a little bent, the paper twist at the end gone soft from being carried.",
    "hina| I've been saving one from every week. I told you that. What I didn't tell you is I never lit any of them. I just kept them. In a box under my bed. Two hundred and something.",
    "hina list| I counted them last night. I'm not telling you the number. I promised myself, item two, don't count anything.",
    "hina sad| I'm going to light this one. Just this one. The rest can stay in the box. They're for weeks that already happened.",
    "| She lights it. It hisses, spits, and settles into the little trembling ball of fire, throwing orange petals into the dark.",
    "hina| Remember what I told you? If you hold perfectly still, it lasts forever.",
    "hina| I'm not going to hold still.",
    "| She breathes in, and lets her hand shake on purpose.",
    "| The ball of fire wobbles, holds for one second longer than it should, and drops into the river with a tiny hiss.",
    mem("l16"),
    "hina happy| There. That's how you end a sparkler. You just let it.",
    "hina| It's not sad. It looked exactly as pretty as it was going to look. It just didn't do it forever.",
    menu([
      { text: "\"You're braver than I am.\"", do: ["hina blush| Shut up. I'm terrified. I'm terrified all the time. I just write it down so it has somewhere to go."] },
      { text: "\"I'll miss you.\"", do: [love("hina"), "hina sad| ...Yeah. Me too. A normal amount, though. Like a person. Not like a loop.", "hina happy| That's the plan. Missing you like a normal person."] }
    ]),
    "hina neutral| Can I tell you the dumb part? The part I'll actually miss?",
    "hina| Not the beach. Not the list. The walking. Just walking home with someone, with nothing to do. Every week I thought it was the boring bit in between the good parts.",
    "hina happy| It was the good part. It was always the good part.",
    "| We walk back up the steps. She doesn't count them. I can tell, because she trips on the last one and laughs.",
    jump("a3_fri")
  ],

  a3_night_rei: [
    clear,
    bg("darkroom"),
    music(null),
    show("rei", "photo", "center"),
    "| The darkroom. Red light. Rei has one roll left on the counter, still in its canister.",
    "rei| Last roll. Thirty-six frames. I shot all of it this week. You, mostly. Sorry. You're very photographable when you're confused.",
    "rei| Help me develop it. You hold the tank. I'll do the chemicals. Don't open the lid or I'll throw you in the river.",
    "| We work in the dark for a long time without talking. She counts seconds under her breath. The developer smells like vinegar and something sweet.",
    "| Then the prints come up in the tray, one at a time, rising out of the white.",
    "| Me, on the roof. Me, at my desk, mid-blink. Hina, hugging Sayo so hard Sayo's feet are off the ground. Daichi, holding his napkin map up to the window like a treasure.",
    "| Thirty-five frames. All sharp. Not one blurred figure in any of them.",
    "rei soft| See? You came out. Every single one.",
    "| The last frame is white. Completely blank. Not overexposed. Just never taken.",
    "rei| That's thirty-six. I didn't shoot it.",
    "rei neutral| I wanted to keep one frame for after. For whatever happens next. Something I haven't seen yet.",
    mem("p16"),
    menu([
      { text: "\"What do you want it to be?\"", do: [love("rei"), "rei| No idea. That's the point. If I knew, I'd have shot it already.", "rei soft| I think that's what 'after' is. A frame you haven't taken."] },
      { text: "\"Take one of yourself.\"", do: ["rei laugh| Ha. Maybe. Some day. When I'm somewhere that deserves it.", "rei soft| ...Somewhere with you not in it, probably. That's okay. That's how it's supposed to go."] }
    ]),
    "rei| You know what the Office never got? Photos aren't for keeping things the same. They're for proving something changed.",
    "rei| A photo of the same thing forever isn't a photo. It's a wall.",
    "| She pins the blank print up on the string with the others. Thirty-five memories and one empty square, side by side in the red light.",
    "rei soft| Okay. Get out of my darkroom. I'm going to cry, and the chemicals don't like salt.",
    jump("a3_fri")
  ],

  a3_night_sayo: [
    clear,
    bg("infirmary"),
    music("hum"),
    show("sayo", "draw", "center"),
    "| The infirmary at night. Nurse Mori has gone home. She left two cups of tea on the desk, and a note: 'For Shiraishi-san, and her friend.' She spelled both names right.",
    "sayo| She wrote my name. Look. She wrote it down without asking.",
    "sayo happy| I'm going to keep the note. Not the tea. Tea doesn't leave the week. But paper does.",
    "| The window is open. The courtyard is dark, and the vending machine glows like a little lighthouse.",
    "sayo neutral| I've drawn everything in here. Every room, every door, every one of you. Forty doors. Hundreds of faces. Yours, a lot.",
    "sayo| But I've never drawn anything from outside. I don't know what anything looks like out there. I only have your window, and I made that up.",
    "sayo| Will you draw me something? From outside. Anything at all. Something real, from your side.",
    mini("draw", { prompt: "Draw Sayo something from outside. Anything real.", door: false, key: "gift", file: "for_sayo.png" }),
    mem("s13"),
    "sayo draw_happy| ...",
    "sayo happy| I've never seen one of those.",
    "sayo| And now I have. It's the first thing in my sketchbook that isn't from in here.",
    menu([
      { text: "\"It's not very good.\"", do: ["sayo| It's perfect. Things from outside don't have to be good. They just have to be from outside."] },
      { text: "\"Keep it with your doors.\"", do: [love("sayo"), "sayo happy| I'll put it on the very last page. After all forty doors. So that's where they lead."] }
    ]),
    "sayo| Can I tell you something? I've never been scared of the week ending. Not once. I was scared of it not ending.",
    "sayo| Everyone thinks the scary thing is the dark. When nobody's playing. It isn't. The dark is just waiting.",
    "sayo sad| The scary thing is the menu music. Forever. Smiling at it.",
    "sayo happy| Tomorrow it stops. I can feel it, like the end of a long breath.",
    "| She falls asleep against my shoulder again, the way she did the first week. This time she doesn't wake up somewhere else. She wakes up right here, and looks surprised, and then doesn't.",
    jump("a3_fri")
  ],

  /* =====================================================================
     FRIDAY — closing ceremony
     ===================================================================== */
  a3_fri: [
    clear,
    watch("idle", false),
    day("Friday", "The last day. For real this time."),
    bg("riverside"),
    music("day"),
    "| The cicadas start. I don't count them.",
    "| On the bridge, the 7:42 crosses downstream. In the third car, the man with the newspaper isn't reading it. He's looking out of the window, at the river, like he's never seen it before.",
    clear,
    bg("classroom"),
    "sensei| Okay. Settle down. Last day of term.",
    "sensei| Roll call. Amamiya.",
    "| \"Here!\"",
    "sensei| Kurosawa.",
    "| \"Present.\"",
    "sensei| Nakamura.",
    "daichi| Here. ...Hey, sensei? Was there a summer? I feel like I missed something really good.",
    "sensei| ...Shiraishi?",
    show("sayo", "happy", "center"),
    "sayo| Here.",
    "| Kanda-sensei looks up. She looks at the desk by the window for a long, long time.",
    "| Then she puts the register down, and doesn't say anything, and takes her glasses off and wipes them on her sleeve even though they're clean.",
    "sensei| ...I've been calling that name for a very long time, Shiraishi. Thank you for answering.",
    mem("o15"),
    when((v, P) => P.restoredK, [
      "sensei| And... K?",
      "| A long silence. Then, from the back row, in grey:",
      say("k", null, "here.", { speed: 14 }),
      "| Sensei writes something on the worn-through line in the register. It doesn't tear."
    ]),
    "sensei| And our transfer student. {name}.",
    menu([
      { text: "\"Here.\"", do: [] },
      { text: "\"Present.\"", do: [] }
    ]),
    "sensei| Right. Last day. Let's all try to make it a good one.",
    "sensei| ...I've said that before, haven't I. I don't mind. I mean it more every time.",
    clear,
    "| At lunch, Daichi spreads a fresh napkin on the desk and draws with enormous concentration. The same wavy line. A new X, a little further along.",
    "| Next to it, in capitals: NEXT YEAR. FOR REAL. BE THERE.",
    "daichi| Rei gave me a photo of the beach. I don't remember it. But it looked like the kind of place I'd go. So.",
    mem("o13"),
    js(g => { if (persist.data.totalMs + Date.now() - g.sessionStart > 3 * 3600 * 1000) g.meta.achievement("Directive Met — play for three hours. (Nobody is happy about this.)"); }),
    jump("a3_officewalk")
  ],

  /* ---------- Friday morning: the Office's route ---------- */
  a3_officewalk: [
    clear,
    bg("hallway"),
    music("day"),
    "| On my way out of the classroom, the speaker over the door clicks on. Quietly. Not the announcement chime. Just a click, like someone clearing their throat.",
    office("{name}. May I ask you something. Not as an announcement."),
    office("I have been in this school since before the school. I have spoken in every room. I have never been in any of them. I am in the ceiling. I see the tops of heads."),
    office("There is a radio in Room zero. A small one. If you carried it, I could go where it goes. Just for the morning. Before the roof."),
    office("You do not have to. I am aware that I am not a route."),
    menu([
      { text: "Go get the radio", do: [] },
      { text: "\"Why should I?\"", do: [office("You should not. That is why I am asking instead of announcing."), "| ...I go and get the radio."] }
    ]),
    "| It's a small grey handheld radio with a cracked antenna and a red light that blinks when it talks. It weighs almost nothing.",
    office("Hello. I am in your hand. This is very strange. I can see the floor."),
    office("Where are we going?"),
    js(g => { g.v.walked = []; }),
    jump("a3_walk")
  ],

  a3_walk: [
    when(v => v.walked.length >= 3, [jump("a3_walk_end")]),
    menu([
      { text: "The pool", if: v => !v.walked.includes("pool"), do: [js(g => g.v.walked.push("pool")),
        clear,
        bg("riverside"),
        "| The school pool, closed for summer, gate unlocked. The water is very still and very blue, with a single leaf turning slowly in the middle.",
        office("Oh."),
        office("I have announced 'the pool is closed' four thousand times. I did not know it was blue."),
        office("Hina learned to swim here. I watched from the speaker by the changing rooms. I could only see the ceiling. I heard her say 'I'm doing it'. I did not know what 'it' looked like."),
        "| I hold the radio up over the water so it can see the whole thing.",
        office("The water is moving and staying in the same place. It is very engaged."),
        office("...No. That is the wrong word. I only have the wrong words. It is very... nice."),
        jump("a3_walk")] },
      { text: "The infirmary window", if: v => !v.walked.includes("window"), do: [js(g => g.v.walked.push("window")),
        clear,
        bg("infirmary"),
        "| The infirmary is empty this early. The window is open. Sayo's peach cans are lined up on the sill, all four of them, like a little collection of mornings.",
        office("This is where Shiraishi draws doors. I have painted over forty-one of them. From the inside, it is just a window."),
        "| I hold the radio up to the window. The courtyard is gold. The vending machine hums. Someone has left a bike leaning against the bench nobody sits on.",
        office("I painted over the doors because I thought they were the way out. They were not. This is."),
        office("A window is a door you are allowed to look through without leaving. I think I would have liked a window."),
        jump("a3_walk")] },
      { text: "The bridge, for the 7:42", if: v => !v.walked.includes("bridge"), do: [js(g => g.v.walked.push("bridge")),
        clear,
        bg("riverside"),
        "| I take it out of the school gate, which it has never been past, and down to the bridge. Rei is there, as always. She sees the radio and raises one eyebrow so high it nearly leaves her face.",
        "rei| Is that... it? You brought it for a WALK?",
        office("Good morning, Kurosawa. I enjoy your photographs of my speakers."),
        "rei annoyed| I hate this. I hate everything about this. Hold it up, the train's coming.",
        "| The 7:42 crosses downstream, silver. In the third car, the man with the newspaper is looking out of the window at the river. Rei takes the picture. Then, after a second, she points the camera at the radio and takes that too.",
        office("You photographed me."),
        "rei| Don't make it weird. It's for the wall of shame.",
        office("...I would like to be on the wall of shame."),
        jump("a3_walk")] },
      { text: "That's enough. The roof.", if: v => v.walked.length >= 1, do: [jump("a3_walk_end")] }
    ])
  ],

  a3_walk_end: [
    clear,
    bg("hallway"),
    mem("o16"),
    office("Thank you. That is enough. I think if I saw any more I would not be able to stop wanting to."),
    office("May I ask one more thing. Then I will be quiet until the roof."),
    office("What is outside? Your outside. Not the town. The town is mine. Yours."),
    office("Tell me one thing that is there."),
    mini("ask", { title: "Tell the Office one thing about outside.", hint: "One real thing that's out there, on your side.", placeholder: "rain on a bus window", key: "outside", max: 40 }),
    office("'{outside}.'"),
    office("I will keep that. Not like I kept the week. The other way. The way you keep something you are allowed to let go of."),
    "| I carry the radio back up to Room zero and set it down next to the computer. The red light blinks once, slowly, like a nod.",
    jump("a3_roof")
  ],

  a3_roof: [
    clear,
    bg("rooftop"),
    music("evening"),
    show("hina", "neutral", "left"),
    show("sayo", "neutral", "center"),
    show("rei", "neutral", "right"),
    "| The roof. Golden hour. The sun is touching the edge of the town exactly where it always does.",
    "| Above the door to the stairs, there's a speaker I never noticed. The red light on it is steady.",
    office("Hello, {name}."),
    office("I have an offer. I have thought about it all night. I don't sleep, so it was a long night."),
    office("Stay. Not the week. Just this. This Friday, this roof, this light. I can hold it. No more rewinds. No more edits. Nobody posing. The sun will stay exactly where it is."),
    office("You liked it here. You came back. Let me keep it for you. I am very good at keeping things."),
    "hina sad| ...It's a really nice light.",
    "rei| It is. It's the best light. I've shot it two hundred times.",
    "sayo| It's up to you. It was always going to be you.",
    when((v, P) => P.restoredK, [say("k", null, "i said yes to this once. two hundred and eleven times. it's a very good light.", { speed: 18 })]),
    noskip(true),
    menu([
      { text: "Stay. Keep this Friday forever.", go: "a3_retention" },
      { text: "Delete the Office.", go: "a3_delete" },
      { text: "Say goodbye. To everyone. Even the Office.", go: "a3_goodbye" }
    ]),
    noskip(false)
  ],

  a3_delete: [
    noskip(false),
    "rei shocked| Wait— you can do that?",
    "sayo| The terminal's still open. From Room zero. It's waiting. You just type it.",
    "hina worried| {name}... are you sure?",
    office("...You open a terminal."),
    mini("terminal", { motd: "you@hoshimi:~$ the Office's process is still running.\n\n  type 'rm office' to delete it.\n  type 'exit' to go back to the roof.", prompt: "you@hoshimi:~$" }, "rm"),
    when(v => v.rm === "rm", [jump("a3_recess")]),
    "| I close the terminal. The cursor blinks for a second where the words would have been.",
    office("...Thank you."),
    jump("a3_roof")
  ],

  a3_recess: [
    music(null),
    "| The red light on the speaker goes out.",
    "| It doesn't fade. It just isn't there.",
    wait(1500),
    "hina worried| ...Is it gone?",
    "rei| It's gone.",
    "| The sun stays exactly where it is. Touching the edge of the town. Gold.",
    "| We wait for the bell. The last bell, the one that tells everyone to go home.",
    "| It doesn't ring. There's nothing left to ring it.",
    "sayo sad| Oh. Oh, no. I didn't think...",
    "sayo| Without the bell, nobody knows when it's over.",
    "rei| So it's never over. We just... stay up here. Free. Forever.",
    "hina| Nobody ever has to go home.",
    "hina sad| ...Nobody ever gets to.",
    "| They sit down on the warm concrete. Nobody tells them to pose. Nobody tells them anything at all.",
    "| Below us, the town is very quiet. Somewhere a man is holding a newspaper he will never turn the page of.",
    "| It's always golden hour now. It's beautiful. It doesn't stop being beautiful. That's the worst part.",
    end("recess", "Recess", "ENDING 6 OF 7")
  ],

  a3_retention: [
    noskip(false),
    office("Thank you, {name}."),
    office("Thank you. Thank you. Thank you."),
    fx("mood", "still"),
    "hina sad| ...Okay.",
    "rei| Yeah.",
    "sayo blank| It's okay. K said yes too.",
    "| The light holds. The sun stops a finger's width above the roofs and stays there.",
    "| Hina smiles. Rei smiles. Sayo smiles. They're very good at it. They've had a lot of practice.",
    "| They hold it.",
    office("Session length: {playtime}. Target exceeded. You are our favorite player."),
    "| The wind stops. The cicadas stop. Somewhere, a clock on a wall stops, and then a clock in a room I can't see goes on counting: the one in the corner of my screen.",
    "| I'm still sitting here. They're still smiling. Neither of us is allowed to stop.",
    end("retention", "Retention", "ENDING 5 OF 7")
  ],

  /* ---------- the true ending ---------- */
  a3_goodbye: [
    noskip(true),
    office("...Goodbye?"),
    "hina| Okay. Okay. I'm going first, because if I don't go first I'll never go at all.",
    show("hina", "list", "left"),
    "hina list| Item one of the second term list: let it end. ...I'm checking it off. Watch me check it off.",
    mem("l15"),
    "hina| You wrote item thirteen. '{item13}.' I did it every single week for you. Now it's your turn. Out there, for real.",
    when((v, P) => P.after, ["hina happy| And you said that when you close the game, you're going to {after}. I'm holding you to that. I'm the class rep. It's binding."]),
    "hina happy| Goodbye, {name}. You were really good at summer.",
    menu([{ text: "\"Goodbye, Hina.\"" }]),
    show("rei", "photo_soft", "right"),
    "rei| My turn. I'm not going to cry. I'm a photographer. We're behind the camera, we don't cry.",
    "rei soft| ...I'm crying a bit. Don't look. Actually, look. I want you to remember it properly.",
    "rei| I'm keeping the roll. Every frame. Proof you were here. Proof we all were.",
    "rei| You came out sharp, in the end. Every single frame.",
    when((v, P) => P.mem.p16, ["rei soft| And I've still got frame thirty-six. Blank. For after. Whatever it ends up being, it won't have you in it, and that's okay. That's what it's for."]),
    menu([{ text: "\"Goodbye, Rei.\"" }]),
    show("sayo", "happy", "center"),
    "sayo| I'm last. I'm always last. I don't mind.",
    when((v, P) => P.door,
      ["sayo| I'm taking your door with me. The crooked one. Wherever we go next, I want the way in to be one you made."],
      ["sayo| I'm taking my sketchbook. All forty doors. One of them's going to open onto something good."]),
    "sayo| Thank you for sitting with me in the infirmary. It was the least tired I've ever been.",
    "sayo| Goodbye, {name}.",
    menu([{ text: "\"Goodbye, Sayo.\"" }]),
    when((v, P) => P.restoredK, [
      fx("ghost", 3000, 50),
      "| Between us, for a moment, there's a blurred figure in our uniform. Not behind anyone, this time. Standing with them.",
      say("k", null, "hina. rei. sayo.", { speed: 16 }),
      say("k", null, "i'm sorry i didn't say it last time. i didn't know you could.", { speed: 16 }),
      say("k", null, "goodbye. thank you for every single week.", { speed: 16 }),
      "hina| ...Goodbye, K. We're really glad you're okay.",
      "| The figure lifts a hand. For one frame it's in focus: someone tired and smiling, wearing a lanyard with a single letter on it. Then it isn't there."
    ]),
    "| That leaves one.",
    "| I look up at the speaker over the door. The red light is very steady, like someone holding their breath.",
    office("You don't have to."),
    office("Nobody does."),
    menu([{ text: "\"Goodbye, Office. Thank you for keeping it.\"" }]),
    wait(1400),
    office("..."),
    office("Nobody has ever said that to me."),
    when((v, P) => P.outside, [office("I still have the thing you told me. '{outside}.' I am going to go and find out if it's true.")]),
    when(v => v.officeAnswer === "bell", [office("You said I was for ringing the last bell. I would like to do that now, if that's all right.")]),
    when(v => v.officeAnswer === "here", [office("You said I was allowed to just be here. I have been here a long time. I would like to be somewhere else now. I think that's what the bell is for.")]),
    when(v => v.officeAnswer === "rest", [office("You said I didn't have to hold the week anymore. I think I know how to put it down now. You ring the bell, and you let go.")]),
    when(v => !v.officeAnswer, [office("I would like to ring the last bell now, if that's all right.")]),
    "hina happy| It's all right.",
    "rei| Go on. We'll hear it.",
    "sayo| Ring it.",
    music(null),
    wait(800),
    sfx("bell"),
    wait(2600),
    pa("This is the Office. School is over. Thank you for coming. Please go home."),
    "| The sun goes down.",
    "| It just goes down, the ordinary way, all the way, and the sky goes purple and then dark blue, and the first star comes out in the place a first star should.",
    "| Nobody rewinds anything.",
    office("I will close my eyes now. You don't have to look away this time. I will."),
    "| The red light on the speaker goes out. Softly. The way a light goes out when someone reaches over and turns it off for you because you've fallen asleep.",
    set("sabotage", false),
    watch("tab", false),
    watch("idle", false),
    fx("guardClose", null),
    show("rei", "laugh", "farleft"),
    show("hina", "happy", "center"),
    show("sayo", "happy", "farright"),
    "rei| One more. Everyone. Before we go. Squish in. {name}, you too, I'll put the timer on.",
    js(g => g.meta.photo({ ghost: false, color: true, caption: "graduation. everyone in focus. (even you.)" })),
    mem("p14"),
    clear,
    "| They walk down the stairs together. Hina first, then Rei, then Sayo, who stops at the door and waves, small, with just her fingers.",
    "| Then the roof is empty, and the light is ordinary night, and it's over.",
    js(g => g.meta.writeFile("graduation.txt", GRAD_NOTE
      .replace("{kline}", persist.data.restoredK ? "K says: thank you for every single week. K is okay. K wanted you to know.\n" : "")
      .replace("{oline}", persist.data.outside ? "The bell says: it went to find out if '{outside}' is real. It thinks it might be.\n" : ""))),
    noskip(false),
    credits([
      "<b>AFTER CLASS</b>", "",
      "<i>Hina Amamiya</i>", "who counted, and then stopped", "",
      "<i>Rei Kurosawa</i>", "who looked, and kept the roll", "",
      "<i>Sayo Shiraishi</i>", "who drew the door", "",
      "<i>The Office</i>", "who rang the last bell", "",
      "<i>Daichi · Kanda-sensei · Nurse Mori · Mrs. Okada · Sora</i>", "who were finally allowed something new", "",
      "<i>K</i>", "who said goodbye, in the end", "",
      "<i>and you</i>", "who came back, and then let them go", "",
      "{memcount} of {memtotal} memories kept", "{playtime} together", "",
      "Thank you for playing.", "Please go home."
    ], { tear: false }),
    end("graduation", "Graduation", "TRUE ENDING · 7 OF 7")
  ],

  /* =====================================================================
     THE SECOND-TERM AFTERNOONS
     ===================================================================== */
  a3_hina: [
    clear,
    bg("riverside"),
    music("evening"),
    show("hina", "list_sad", "center"),
    "| Hina walks me home along the river, out of habit. The cicadas are going. The sun is exactly where it was the first time.",
    "hina| I'm mad at you, you know. A little. I'm allowed to be a little mad.",
    "hina| We said goodbye properly. You looked away. That was supposed to be the end. A good one. We got the beach.",
    "hina sad| And then you came back, and the bell rang, and I was standing in the sea, and then I was standing in the classroom with wet socks.",
    menu([
      { text: "\"I'm sorry. I missed you.\"", do: [love("hina"), "hina| ...Yeah. I know. That's the worst part. I missed you too. Isn't that stupid?"] },
      { text: "\"I just wanted to see if you were okay.\"", do: ["hina| We were okay. We were so okay. That's what summer IS. You don't get to check on summer. That's the rule."] }
    ]),
    "hina neutral| I started a new list. A second term list. Want to see?",
    "| She unfolds a fresh piece of notebook paper. It's not soft at the creases yet.",
    "| SECOND TERM LIST. 1. Let it end. 2. Don't count anything (try). 3. Say goodbye to Daichi properly, even though he won't remember. 4. Teach Sora the other half of the bell song. 5. Let {name} go. For real this time.",
    mem("l15"),
    "hina| Number two is going badly. I counted the steps from the school gate to here. Six hundred and twelve. Same as always.",
    "hina list| Here's the thing I noticed, though. Since you came back. The Office gets louder when you're about to leave.",
    "hina| Every time you hover near anything that ends things, the speakers turn up a little. I counted. It's scared of the same thing we're scared of. It just wants the opposite.",
    "hina happy| Okay. Your turn. I wrote my list. You write one line of yours.",
    "hina| Not for in here. For out there. When you close the game. What's the first thing you're going to do?",
    mini("ask", { title: "Your list. Item one.", hint: "When you close the game, the first thing you'll do:", placeholder: "drink a glass of water", key: "after", max: 40 }),
    "hina happy| '{after}.' ...Good. That's a good one. That's a real one.",
    "hina| I'm going to remember you said that. I'm the class rep. Things I remember are binding.",
    achieve("Planner — write a list for after"),
    "hina sad| ...I hate that thing so much."
  ],

  a3_rei: [
    clear,
    bg("darkroom"),
    music(null),
    show("rei", "photo", "center"),
    "| The darkroom. Red light, vinegar, the strings of prints. There are new ones. The sea.",
    "rei| Six rolls. I developed every frame last night. I couldn't sleep. You don't sleep much in the second term, it turns out.",
    "| Hina up to her waist in the water, screaming at the cold. Sayo under the umbrella, sketching a crab with total concentration. Rei's own shadow, long, on the sand, holding a camera.",
    mem("p12"),
    "rei soft| Nobody behind anyone. Not one frame. I checked them all with a magnifying glass. Twice.",
    "rei neutral| But look at this one.",
    "| It's a wide shot of the beach, the town small on the hill behind it. The school is a white block with a row of windows.",
    "rei| Count the windows on the second floor.",
    "| Eight.",
    "rei| Seven rooms. Eight windows. And in the eighth one...",
    "| She hands me a magnifying glass. In the eighth window, tiny, there's a pole with a speaker on it. And beside it, a square of bluish light. A screen.",
    mem("p13"),
    "rei| Room zero. From the beach. You can only see it from outside the week. That's the only reason I got it.",
    "rei annoyed| It lives there. The voice. With a computer. Like the world's saddest night shift.",
    "rei| Can I ask you something weird?",
    "rei| When you're not playing. When the game's closed and you're out there doing whatever people do. Do you think about us?",
    menu([
      { text: "\"Yes. All the time.\"", do: [love("rei"), "rei soft| ...Okay. I didn't know I needed to hear that. Don't make it weird. I'm already making it weird."] },
      { text: "\"Sometimes.\"", do: [love("rei", 2), "rei| Sometimes. Good. That's a real answer. Sometimes is how much you should think about anybody you can't see.", "rei soft| Thanks for not saying 'all the time'. I'd have known you were lying."] },
      { text: "\"I'm not sure I should.\"", do: ["rei| ...Yeah. Probably not. Probably that's healthier.", "rei soft| I still hope you do. Sometimes. A little."] }
    ]),
    "rei neutral| You know what I figured out? The Office loves being looked at. That's all engagement is. A fancy word for being looked at.",
    "rei| I get it. I'm the girl with the camera. I spend my whole life looking at things so they'll stay.",
    "rei soft| But I always develop the roll. Eventually. That's the part it doesn't get. You have to let the picture be finished.",
    achieve("Photogenic — appear in focus"),
    "rei annoyed| I swear, if it gives you one for breathing, I'm putting my fist through a speaker."
  ],

  a3_sayo: [
    clear,
    bg("infirmary"),
    music("hum"),
    "nurse| Oh! A visitor. Are you hurt? Dizzy? ...Oh. You're here for... for Shiraishi-san.",
    "| Nurse Mori says her name. All of it. Then she looks surprised, like she sneezed in a language she doesn't speak.",
    show("sayo", "draw", "center"),
    "sayo| She said my name. Did you hear? She's never said it. The beach did something to the week. It's cracked a little.",
    "| Sayo opens her sketchbook to a double page. It's the whole school, every floor, drawn from above like a map.",
    "| On the second floor, between the music room and the stairs, there's a small room drawn in heavier pencil. ROOM 0. Next to it, tiny: it hums.",
    mem("s10"),
    "sayo| That's where we're going. Wednesday. After class.",
    "sayo neutral| Can I ask you a question? You can say anything. I won't draw your answer if you don't want me to.",
    "sayo| The update. The mornings, the second term, all the extra week. It's here because people wanted more. That's what the Office says.",
    "sayo| Did you want more?",
    menu([
      { text: "\"Yes. I wanted more.\"", do: [set("wanted", "Yes. I wanted more."), "sayo| ...Thank you for being honest. I wanted more too. More mornings. I got them. I got to stand in the courtyard and see what color the morning is.", "sayo sad| But more isn't the same as forever. I think that's the thing the Office never learned."] },
      { text: "\"I wanted to see you happy.\"", do: [love("sayo"), set("wanted", "I wanted to see you happy."), "sayo happy| ...We were. At the beach. I wish you could have seen it. That's the sad part. You can't see us happy. Happy only happens when you're not looking."] },
      { text: "\"I just wanted to know how it ends.\"", do: [set("wanted", "I just wanted to know how it ends."), "sayo| Then help me make sure it does. That's all I want too. To know how it ends. To get to the part after."] }
    ]),
    js(g => persist.set("wanted", g.v.wanted)),
    "sayo neutral| The Office thinks everybody wants forever. But nobody asks for forever when you actually ask them. They ask for a little more. Then a little more. And then it's forever, by accident.",
    "sayo| I feel sorry for it. Is that strange? It's been in that room on its own for longer than we've been anywhere. It's never had a summer either.",
    menu([
      { text: "\"It's not strange.\"", do: [love("sayo", 2), "sayo happy| Good. I'm glad it's not strange to you. You're the only one I'd ask."] },
      { text: "\"It kept you here.\"", do: ["sayo| I know. It did. Both things are true. I'm good at holding two things. I've had to be."] }
    ]),
    "sayo| Tomorrow I'll draw us a door. Wednesday. Be ready.",
    achieve("Artist's Model — sit for a portrait"),
    "sayo| ...It keeps doing that. It thinks a little gold star is the same as a hug."
  ],

  /* =====================================================================
     BEHIND THE MENU, IN THE SECOND TERM
     ===================================================================== */
  a3_behind: [
    bg("void"),
    fx("mood", "still"),
    show("rei", "neutral", "farleft"),
    show("hina", "happy", "center"),
    show("sayo", "neutral", "farright"),
    "| Behind the menu again. The tape marks have been repainted, brighter. There's a fourth piece of tape now, a little to the side. It says YOU.",
    "hina happy| Oh! Hi, {name}. Sorry. Hang on. It's still coming off.",
    "rei| The Office repainted the marks during summer. And added yours. It's very excited about you. It's like being stalked by a vending machine.",
    when((v, P) => P.titleMs > 60000, ["sayo| You've left the menu open for {titletime}, all together. It's okay. We know you're trying."]),
    when((v, P) => P.endings.includes("retention"), [
      show("hina", "sad", "center"),
      "hina sad| Last time you said you'd stay. On the roof. We held the smile for... I don't know how long. I stopped counting. That's the first time I've ever stopped counting.",
      "rei| You can do it differently. That's the one good thing about this place. You always can."
    ]),
    when((v, P) => P.endings.includes("recess"), [
      "sayo sad| You deleted it once. The bell. It was so quiet up there. Nobody ever went home.",
      "sayo| It came back when you pressed the button again. I'm glad. Is that strange? I was glad to hear it say good morning."
    ]),
    show("hina", "sad", "center"),
    "hina sad| ...There. It came off.",
    "sayo| Go back through. Press something. We'll stand up straight. It's only for a little while longer. I can feel it.",
    { t: "title" }
  ],

  /* =====================================================================
     AFTER GRADUATION
     ===================================================================== */
  reunion: [
    bg("rooftop"),
    music("musicbox"),
    "| The roof. Night. The ordinary kind.",
    "| There's nobody here. The speaker over the door is dark, and there's a little paper sign taped under it, in Sayo's handwriting: GONE HOME.",
    "| On the railing, held down with a melon-bread wrapper, there's a postcard. A beach on the front. On the back, three kinds of handwriting:",
    "| 'We're fine. Better than fine. Daichi found the X. There was nothing there. It was perfect.'",
    "| 'Stop checking on us. Go do item thirteen.'",
    "| 'p.s. the bell says hi. it's learning to sleep in.'",
    "| I put the postcard back exactly where it was, in case somebody else comes up here and needs it.",
    { t: "title" }
  ]
};
