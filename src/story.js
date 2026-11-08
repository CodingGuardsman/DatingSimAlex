/**
 * story.js — The whole script of After Class.
 *
 * A line is either a string or a command object:
 *   "hina happy| Hello!"   Hina speaks with the "happy" sprite
 *   "rei| Hold still."     Rei speaks, sprite unchanged
 *   "| Narration."         nobody speaks
 *   "me| ..."              the player speaks (shown with their name)
 * {name}, {clock}, {playtime}, {away}, {clicks}, {tabouts}, {screen}, {memcount} and friends are filled in live.
 *
 * Act 1 (first playthrough): a sweet last week before summer, with small things wrong.
 * Act 2 (every playthrough after): the girls remember, and the Office fights to keep you playing.
 * Act 3 (story_act3.js): the second term. You came back after they asked you not to.
 * Behind the title: after the first ending, Sayo draws a door next to the menu.
 */
import { persist } from "./persist.js?v=2.3.0";
import {
  bg, music, sfx, show, hide, clear, wait, jump, set, love, pset, mem, fx, pa, day, menu, when, say,
  watch, log, noskip, end, phone, credits, js, mini, visit, title, call, know,
  cg, scare, subliminal, blood, aiSay, office
} from "./script-helpers.js?v=2.3.0";
import { DRAW_SEEN } from "./story_extra.js?v=2.3.0";
import { ACT3, ACT3_MEMORIES, GRAD_NOTE } from "./story_act3.js?v=2.3.0";
import { EXTRA } from "./story_extra.js?v=2.3.0";
import { DREAD } from "./story_dread.js?v=2.3.0";

export const CAST = {
  // 2.1: close / glass / grab / aim_close / peek are big close-up poses; turn / twirl / lean are wide action poses.
  hina: { name: "Hina", color: "#f39a52", sprite: true, expressions: ["neutral", "happy", "sad", "worried", "blush", "corrupt", "lean", "lean_blush", "list", "list_sad", "close", "turn", "glass", "bleed"] },
  rei: { name: "Rei", color: "#ad8fe6", sprite: true, expressions: ["neutral", "laugh", "annoyed", "shocked", "soft", "corrupt", "aim", "aim_shocked", "photo", "photo_soft", "aim_close", "lean", "grab", "bleed"] },
  sayo: { name: "Sayo", color: "#5fc4b8", sprite: true, expressions: ["neutral", "sad", "scared", "happy", "blank", "corrupt", "draw", "draw_happy", "reach", "reach_blank", "glass", "twirl", "peek", "bleed"] },
  // The minor cast get sprites too. They step on stage when there's room, and wait at the side of the text box when there isn't.
  daichi: { name: "Daichi", color: "#6cbf6c", sprite: true, minor: true, expressions: ["neutral"] },
  sensei: { name: "Kanda-sensei", color: "#7d9fd6", sprite: true, minor: true, expressions: ["neutral"] },
  nurse: { name: "Nurse Mori", color: "#f08fb4", sprite: true, minor: true, expressions: ["neutral"] },
  okada: { name: "Mrs. Okada", color: "#d6a067", sprite: true, minor: true, expressions: ["neutral"] },
  sora: { name: "Sora", color: "#f6c344", sprite: true, minor: true, expressions: ["neutral"] },
  me: { name: "", color: "#c9a6b6" },
  // The Office finally has a body: a PA speaker on a pole. neutral = listening, speak = talking, eye = angry.
  office: { name: "THE OFFICE", color: "#e0483c", sprite: true, office: true, expressions: ["neutral", "speak", "eye"] },
  k: { name: "K", color: "#9a9a9a", sprite: true, ghost: true, expressions: ["neutral"] }
};

/**
 * The Summer Scrapbook. Every memory is earned by a choice, a visit or a discovery.
 * One week can't hold all of them; the scrapbook keeps what you found across every playthrough.
 */
export const MEMORIES = [
  // Hina's summer list
  { id: "l1", book: "list", title: "Make a new friend before summer" },
  { id: "l2", book: "list", title: "Sleep until noon" },
  { id: "l3", book: "list", title: "Sparklers by the river" },
  { id: "l4", book: "list", title: "Popsicles from the konbini by the bridge" },
  { id: "l5", book: "list", title: "Learn to swim properly (for real this time)" },
  { id: "l6", book: "list", title: "Watch the meteor shower" },
  { id: "l7", book: "list", title: "Lunch on the roof with everyone" },
  { id: "l8", book: "list", title: "Beat Daichi at something" },
  { id: "l9", book: "list", title: "See the ocean" },
  { id: "l10", book: "list", title: "Make Rei laugh in a photo" },
  { id: "l11", book: "list", title: "Don't forget anybody" },
  { id: "l12", book: "list", title: "Say goodbye properly" },
  // Rei's photos
  { id: "p1", book: "photo", title: "Monday. You blinked.", bg: "classroom", who: "hina", expr: "happy" },
  { id: "p2", book: "photo", title: "Someone behind your chair", bg: "classroom", ghost: true },
  { id: "p7", book: "photo", title: "Lunch on the roof", bg: "rooftop", who: "hina", expr: "happy" },
  { id: "p3", book: "photo", title: "The darkroom, all red", bg: "darkroom", who: "rei", expr: "photo" },
  { id: "p4", book: "photo", title: "Partners", bg: "darkroom", who: "rei", expr: "soft" },
  { id: "p5", book: "photo", title: "We came out (mostly)", bg: "darkroom", who: "rei", expr: "photo_soft" },
  { id: "p6", book: "photo", title: "The wall of shame", bg: "darkroom", who: "rei", expr: "laugh" },
  { id: "p8", book: "photo", title: "Your screen, from in here", bg: "darkroom", who: "rei", expr: "aim_shocked", ghost: true },
  { id: "p9", book: "photo", title: "K, in focus", bg: "classroom", ghost: true },
  { id: "p10", book: "photo", title: "Rei, on the roof (nobody behind her)", bg: "rooftop", who: "rei", expr: "photo_soft" },
  // Sayo's sketchbook
  { id: "s1", book: "sketch", title: "The box at the bottom", text: "This classroom, drawn from above. Along the bottom, a long dark box full of tiny words. 'There's always one.'", hint: "she draws when she's alone" },
  { id: "s2", book: "sketch", title: "Your face, this time", text: "A careful pencil portrait. Underneath: 'so I remember. this time.'", hint: "she wants to remember someone" },
  { id: "s3", book: "sketch", title: "Three girls in a row", text: "Three girls standing in a row, smiling at nobody. Under them, five little rectangles. 'This is where we wait.'", hint: "a place she doesn't like to talk about" },
  { id: "s4", book: "sketch", title: "Every page a door", text: "The same door, forty times. It's a little more open on every page.", hint: "the sketchbook, when she's asleep" },
  { id: "s5", book: "sketch", title: "The seat by the window", text: "An empty desk by the window, and a girl sitting at it that nobody else can see.", hint: "a Thursday" },
  { id: "s6", book: "sketch", title: "The door, open", text: "The last page. The door is open. There's light on the other side.", hint: "after the week starts again" },
  { id: "s8", book: "sketch", title: "Your window", text: "A window, drawn from your side of the screen. Whatever was really out there, in her drawing it's summer.", hint: "she wants to know what your room looks like" },
  { id: "s7", book: "sketch", title: "Behind the menu", text: "Three pieces of tape on a dark floor. REI. HINA. SAYO.", hint: "she drew you a way in" },
  // Keepsakes from everyone else
  { id: "o1", book: "other", title: "Kanda-sensei's register", text: "One line has been erased so many times the paper went thin. You can still read a K.", hint: "homeroom, the middle of the week" },
  { id: "o2", book: "other", title: "Daichi's beach map", text: "A napkin. One wavy line for the sea, a big X, and BE THERE OR BE A LOSER.", hint: "Daichi has a plan" },
  { id: "o3", book: "other", title: "\"Same as yesterday?\"", text: "Mrs. Okada at the konbini by the bridge, handing over two popsicles before anyone asks.", hint: "the konbini by the bridge" },
  { id: "o4", book: "other", title: "Nurse Mori's sign-in book", text: "Every page: 'Shiraishi Sayo. Tired.' The dates go back years. They are all this week.", hint: "the infirmary" },
  { id: "o5", book: "other", title: "Sayo's letter", text: "'Thank you for sitting with me in the infirmary. It was the least tired I've ever been.'", hint: "she wanted part of her to be outside" },
  { id: "o6", book: "other", title: "K's last entry", text: "'they're not a game to me. tell them that.'", hint: "a save slot that isn't yours" },
  { id: "o8", book: "other", title: "Hina's counting notebook", text: "Pages of tally marks: clicks, tab-outs, hours. The last column says 'days I was happy anyway'. It's the longest.", hint: "Hina, by the river, the second time around" },
  { id: "o7", book: "other", title: "The unknown number", text: "'is this K?' ... 'sorry. you sound like them.'", hint: "a message late on Thursday" },

  // 2.0: the longer week
  { id: "l13", book: "list", title: "13. {item13}" },
  { id: "l14", book: "list", title: "14. Tell {name}" },
  { id: "p15", book: "photo", title: "The bridge, 7:42", bg: "riverside", who: "rei", expr: "photo" },
  { id: "p11", book: "photo", title: "K, through the viewfinder", bg: "darkroom", ghost: true },
  { id: "s12", book: "sketch", title: "The window, from outside", text: "The courtyard bench from above, with the three o'clock cat asleep on it. A tiny speech bubble from the cat: 'good morning, transfer student.'", hint: "the courtyard, early" },
  { id: "s9", book: "sketch", title: "Your door", door: true, text: "You drew it. Sayo says it's the best door anyone has ever made for her, and she's made forty.", hint: "Sayo wants you to draw something" },
  { id: "o9", book: "other", title: "Sora's ninja test", text: "Hina's little brother made you stand on one leg for a full minute behind the bakery counter. You passed. He says you're a 'summer ninja, level one'.", hint: "the bakery by the station, early" },
  { id: "o10", book: "other", title: "The five-star survey", text: "You gave your last week five stars. There was no other option. Your comment: '{survey}'.", hint: "a message from the Student Office, late on Wednesday" },
  { id: "o11", book: "other", title: "Tuesday, again", text: "Sora drew three girls and a person with no face. 'That's the one who watches,' he said. 'Big sis cries every Monday.'", hint: "the bakery, the second time around" },
  { id: "o12", book: "other", title: "The 7:42, again", text: "Rei has photographed the same train at the same second sixty times. The same man is reading the same newspaper in every print.", hint: "the bridge, the second time around" }
];

/** All seven endings, in order. Shown in the scrapbook once found. */
export const ENDINGS = [
  { id: "rewind", name: "Summer Never Comes", text: "The Office postponed summer. The week rewound.", hint: "finish your first week" },
  { id: "detention", name: "Detention", text: "You chose to stay. K chose that too, two hundred and eleven times.", hint: "a Friday, the second time around" },
  { id: "summer", name: "Summer", text: "You said goodbye and looked away, and summer started without you watching.", hint: "a Friday, the second time around" },
  { id: "free", name: "Free Period", text: "You didn't choose. So they didn't have to either. They ate lunch on the floor of the classroom and nobody posed.", hint: "the second term: sometimes the answer is to not pick" },
  { id: "retention", name: "Retention", text: "You took the Office's offer. The perfect Friday, forever. Your playtime is still counting.", hint: "the second term, the last Friday" },
  { id: "recess", name: "Recess", text: "You deleted the Office. Nobody rings the bell now. It's always golden hour, and nobody ever has to go home.", hint: "the second term, the last Friday" },
  { id: "graduation", name: "Graduation", text: "Everyone said goodbye. Even the Office. Especially the Office.", hint: "the second term: say goodbye to everyone. Everyone." }
];

MEMORIES.push(...ACT3_MEMORIES);

/**
 * "What we know": the scrapbook page that keeps the story straight.
 * Each note is a question that shows up once the game has raised it (ask) and turns into
 * an answer once the player has actually been told (know). Both look at what persists, so a
 * note never runs ahead of the script. P.known holds the few clues that have no memory of their own.
 */
const k = (P, id) => !!(P.known && P.known[id]);
export const NOTES = [
  { id: "loop", q: "Why does everything keep happening twice?",
    a: "The week is a loop. Every Friday it rewinds to Monday. Almost everyone forgets. Hina, Rei and Sayo don't.",
    ask: P => P.mem.o3 || P.mem.p15 || P.mem.s5 || k(P, "loop"), know: P => P.mem.o4 || P.endings.includes("rewind") },
  { id: "office", q: "Who is \"the Office\"?",
    a: "The voice on the school speakers. It keeps the week looping, because if the week ends, people stop playing.",
    ask: P => P.mem.o1, know: P => P.runs > 0 },
  { id: "k", q: "Who is K?",
    a: "The player before you. K played this same week for 412 hours, then stopped without saying goodbye.",
    ask: P => P.mem.o1 || P.mem.p2, know: P => P.runs > 0 },
  { id: "three", q: "Why do Hina, Rei and Sayo remember?",
    a: "Each of them found a way to hold on. Hina counts. Rei takes photos. Sayo draws, and she's been aware the longest.",
    ask: P => P.mem.s1 || P.mem.p4 || P.mem.s5, know: P => P.mem.o5 || P.mem.s6 || P.mem.o8 },
  { id: "menu", q: "What is the place with the music and the three girls standing still?",
    a: "The title screen. Whenever the game is open and nobody presses anything, they stand behind the menu on tape marks and smile.",
    ask: P => P.mem.s3 || P.mem.s1, know: P => P.behind || P.mem.s7 },
  { id: "end", q: "How does the week ever end?",
    a: "Only when nobody is watching it. Say goodbye properly, then actually look away.",
    ask: P => P.runs > 0, know: P => P.mem.s6 || P.endings.includes("summer") },
  { id: "kwhy", q: "Why did K really leave?",
    a: "K got a job, a real Monday that ends, and didn't know you could say goodbye to a game. It wasn't because of them.",
    ask: P => P.runs > 0, know: P => P.mem.o6 || P.mem.f3 },
  { id: "room0", q: "Eight windows on the second floor, seven rooms. What's in the eighth?",
    a: "Room zero. The Office lives there, with an old computer that runs the week.",
    ask: P => k(P, "room0") || P.mem.s10, know: P => P.mem.p13 || P.mem.f2 || P.mem.f5 },
  { id: "again", q: "What happens if I come back after summer?",
    a: "The second term. Summer only lasts while you're away. The moment you look again, it's a school day.",
    ask: P => P.endings.includes("summer"), know: P => P.act3 },
  { id: "longer", q: "Why is the week longer now?",
    a: "Management ordered the Office to make every session last at least three hours. The patch notes were real.",
    ask: P => P.act3, know: P => P.mem.f2 },
  { id: "plan", q: "What's the plan this term?",
    a: "Get into Room zero on Wednesday and switch the extra week off. Then, on Friday, the week is allowed to end.",
    ask: P => P.act3, know: P => P.mem.f5 },
  { id: "why", q: "What does the Office actually want?",
    a: "It was built to ring the school bell. When K stopped coming, it held the week perfectly still so nothing would change before K got back. K never came back.",
    ask: P => P.act3, know: P => P.mem.f6 }
];

const SAYO_LETTER = name => `To ${name},

If you're reading this, you took it with you. Good. Now some of me is outside.

I don't know what your room looks like. I like to imagine there's a window, and that it's summer there.

Here is what I know:
 - The week is a circle. It goes around as long as someone is watching.
 - Hina counts. Rei looks. I draw. That's how each of us remembers.
 - K didn't leave because of us. I have to believe that.
 - It isn't your fault. None of it is your fault.

When the time comes, please look away. Not because we want you gone.
Because summer can't start while someone is watching it.

Thank you for sitting with me in the infirmary.
It was the least tired I've ever been.

  — Sayo
`;

const HINA_LIST_1 = `HINA'S SUMMER LIST

 1. Make a new friend before summer  [x]
 2. Sleep until noon
 3. Sparklers by the river
 4. Popsicles from the konbini by the bridge
 5. Learn to swim properly (for real this time)
 6. Watch the meteor shower
 7. Lunch on the roof with everyone
 8. Beat Daichi at something (anything)
 9. See the ocean
10. Make Rei laugh in a photo
11. Don't forget anybody
12. Don't let K leave
13. {item13}   <- {name} wrote this one
`;

const HINA_LIST_2 = `HINA'S SUMMER LIST

 1. Make a new friend before summer  [x]
 2. Sleep until noon
 3. Sparklers by the river
 4. Popsicles from the konbini by the bridge
 5. Learn to swim properly (for real this time)
 6. Watch the meteor shower
 7. Lunch on the roof with everyone
 8. Beat Daichi at something (anything)
 9. See the ocean
10. Make Rei laugh in a photo
11. Don't forget anybody
12. D̶o̶n̶'̶t̶ ̶l̶e̶t̶ ̶K̶ ̶l̶e̶a̶v̶e̶
12. Let {name} leave.
13. {item13}   <- I did this one every week. every single week.

You did {memcount} things with us. I wrote every one of them down.
I counted {clicks} clicks today. Thank you for every one of them.
`;

const K_NOTE = `is someone there?

i can hear the bell again. that means somebody pressed new game.

if it's you: they're going to remember you now. that's how it starts.
please be nicer to them than i was. i stayed too long and then i left without saying anything.

the save slot is still mine. you can open it after the first ending. i left something in it.

and don't leave the menu open when you're not looking. they have to stand there.

- K
`;

const BEACH_NOTE = `{name}!! IT'S SUMMER!!!

We're at the beach. Rei brought six rolls of film. Sayo is drawing the sea and it actually looks like the sea.
Daichi's map was wrong. There was no X. We found the beach anyway.

We closed the game for you so you wouldn't wait up. Please don't open it for a while. We'll be busy.

You kept {memcount} of our memories in your scrapbook. Keep them somewhere safe. Somewhere outside.

Item thirteen was yours: {item13}. Go and actually do it. Out there.
Item fifteen: have the best summer ever. That's an order from your class rep.

Love,
Hina, Rei & Sayo
`;

/** The group chat, one night at a time. */
/** Monday and Tuesday are only sweet: an afternoon then plays scene 1, then scene 4 (the purely happy ones). The cracks wait for Wednesday. */
const SWEET_FIRST = { sweet: [1, 4], until: 2 };

const NIGHTS = {
  1: g => [
    ["hina", "welcome to the group chat {name}!!! 🎉🎉"],
    ["daichi", "rule 1 of summer squad: no homework talk"],
    ["rei", "rule 2: daichi isn't allowed to name things"],
    ["daichi", "too late. it's called summer squad. it's beautiful"],
    ["hina", "did you get home ok? ☺"],
    ["me", "I did. Thanks for today."],
    ["hina", "!!!!!!!!"],
    ["rei", "she's screaming into a pillow. i can hear it from my house. we live 2km apart"],
    ...(g.v.picked.at(-1) === "sayo" ? [["hina", "wait where did you go after class? i looked for you"], ["me", "The infirmary. With Sayo."], ["hina", "oh! is she ok? 🥺"]] : []),
    ["hina", "goodnight everyone!! 4 more days!!! ☀"]
  ],
  2: g => [
    ["rei", "developed today's roll"],
    ["rei", "[photo: daichi eating an onigiri the size of his head]"],
    ["daichi", "i look incredible"],
    ["hina", "SOFTBALL ONIGIRI 😭😭"],
    ["hina", "{name} i still have your rice ball. i didn't eat it. it's in the fridge. is that weird. don't answer"],
    ["rei", "it's weird"],
    ["rei", "[photo: four people lying on a roof, from above. a timer shot]"],
    ["hina", "WAIT when did you take that"],
    ["rei", "i'm a professional"],
    ["hina", "setting it as my lock screen. forever. ♡"],
    ["hina", "8 hours of sleep tonight everyone!! training for list item 2"],
    ...(g.v.picked.at(-1) === "sayo"
      ? [["me", "Sayo says hi, by the way."], ["hina", "who? 😊"], ["rei", "hina."], ["hina", "oh!! sorry!! sayo!! of course. i don't know why i said that"]]
      : [["me", "Goodnight."]]),
    ["daichi", "3 DAYS"],
    ["rei", "it's 4 days daichi"],
    ["daichi", "i'm rounding"]
  ],
  3: g => [
    ["rei", "developed today's roll"],
    ["rei", "there's one i'm not posting"],
    ["daichi", "is it me looking cool"],
    ["rei", "no"],
    ["daichi", "BEACH COUNTDOWN: 3"],
    ["hina", "3!!!!"],
    ["hina", "{name} are you bringing a swimsuit? 🌊"],
    ["me", "Do I need one?"],
    ["rei", "you need one. hina is going to make everyone swim. it's on the list"],
    ["hina", "it IS on the list"],
    ["hina", "goodnight!! ♡"]
  ]
};

export const SCRIPT = {
  /* =====================================================================
     ENTRY
     ===================================================================== */
  start: [
    when((v, P) => P.act3 && !P.graduated, [jump("a3_start")]),
    when((v, P) => P.runs > 0, [jump("r_start")], [jump("a1_mon")])
  ],

  /** Naming yourself after one of them. They notice. */
  named_girl: [
    bg("classroom"),
    music(null),
    when((v, P) => P.name.toUpperCase() === "HINA", [
      "hina worried| ...That's my name.",
      "hina happy| I mean, I don't own it. Lots of people are called Hina. Probably. I've never met one.",
      "hina| But if you're Hina too, then when someone says 'Hina' we'll both turn around, and that's going to be a whole thing all week."
    ]),
    when((v, P) => P.name.toUpperCase() === "REI", [
      "rei annoyed| No. Absolutely not. There's one of me. That's the correct number.",
      "rei| ...Fine. But if anyone shouts 'Rei' and you answer, I'm taking your photo every time. Unflattering ones."
    ]),
    when((v, P) => P.name.toUpperCase() === "SAYO", [
      "sayo| ...Oh.",
      "sayo| Nobody remembers my name. And you picked it. On purpose.",
      "sayo happy| You can keep it. I'd like someone else to have it for a while. Then it gets remembered twice."
    ]),
    menu([
      { text: "Keep the name", do: [jump("start")] },
      { text: "Pick a different one", do: [js(g => { g.frames = []; g.askName(); })] }
    ])
  ],

  named_office: [
    bg("classroom"),
    music(null),
    sfx("chime_down"),
    say("office", null, "That name is reserved."),
    say("office", null, "Please choose another name. Students may not be the Office. There is only one Office. There has only ever been one."),
    js(g => { g.frames = []; g.askName(); })
  ],

  named_k: [
    bg("classroom"),
    music(null),
    fx("glitch", 700),
    say("hina", "worried", "...K?", { as: "???" }),
    "sayo| That isn't your name.",
    "sayo| Please. Tell us your real one.",
    { t: "js", run: g => { g.frames = []; g.askName(); } }
  ],

  /* =====================================================================
     ACT 1 — THE LAST WEEK
     ===================================================================== */
  a1_mon: [
    day("Monday", "Five days until summer break."),
    bg("classroom"),
    music("day"),
    "| The last week of term. The windows are open and the whole classroom smells like warm dust and somebody's orange soda.",
    "| I transferred to Hoshimi Academy three weeks ago. Not that it matters. In five days it's summer, and nobody makes friends in the last week.",
    "sensei| Okay, okay. Settle down. Last week of term. I know. I can feel your souls leaving your bodies from here.",
    "| Kanda-sensei, our homeroom teacher, has the voice of someone who has been awake since sometime last year.",
    "sensei| Roll call. Amamiya.",
    "| \"Here!\" A bright voice from the front row. A sunflower hair clip bobs.",
    "sensei| Kurosawa.",
    "| \"Present,\" says someone flatly, from behind a camera.",
    "sensei| Nakamura.",
    "daichi| YO.",
    "sensei| A simple 'here' will do, Daichi.",
    "sensei| Shiraishi?",
    "| Nobody answers. Sensei looks at the empty desk by the window for a long moment, then makes a small mark without saying anything.",
    "sensei| ...And our transfer student. {name}?",
    menu([
      { text: "\"Here!\"", do: ["sensei| Enthusiasm. In the last week. I'm moved. Truly."] },
      { text: "\"Present.\"", do: ["sensei| Very professional. Kurosawa, you have competition."] }
    ]),
    "sensei| Right. Last week. Let's all try to make it a good one. I'm told that's my job.",
    "| First period is maths. Nobody is doing maths. The fan in the corner turns its head back and forth like it's watching a very slow tennis match.",
    "| Halfway through, something lands on my desk. A note, folded into a tiny triangle, with a sunflower drawn on the outside.",
    "| Inside, in round pink handwriting:",
    "| 'Hi new person!! Do you like melon bread? ☐ yes  ☐ YES  ☐ extremely yes'",
    menu([
      { text: "Tick 'extremely yes'", do: [love("hina"),
        "| I tick the box and send it back the way it came, two desks forward. A girl in the front row with a sunflower clip unfolds it, reads it, and has to put her face in her arms so Sensei doesn't see her grinning."] },
      { text: "Draw a fourth box: 'what's melon bread?'", do: [
        "| I add a box and send it back. Two desks forward, a sunflower clip goes very still.",
        "| The note comes back thirty seconds later. It just says 'oh my god. OH MY GOD. lunch. you and me. this is an emergency.' with three underlines."] }
    ]),
    "sensei| Amamiya. Whatever is so funny about quadratic equations, I'd love to hear it.",
    "| \"Nothing, Sensei! They're just very beautiful today!\"",
    "| Somebody behind me snorts. The fan turns its head. The cicadas outside get louder, like they're laughing too.",
    "| The bell goes for break. Before I can even stand up, there's a shadow over my desk.",
    "hina close| Hey! Transfer student!",
    "| A girl with a sunflower clip in her hair drops into the seat in front of me, backwards, arms folded over the chair.",
    "hina lean| I'm Hina. Amamiya Hina. Class rep, unofficial welcoming committee, professional walker-home-of-new-people.",
    "hina neutral| Sensei said nobody's shown you around yet. Which is a crime. So! That's me now.",
    menu([
      { text: "Nice to meet you, Hina.", do: [love("hina"), "hina happy| See? Was that so hard? We're basically best friends now."] },
      { text: "I've been here three weeks.", do: ["hina blush| I know, I know. I'm late. I was working up the courage, okay?"] }
    ]),
    "hina neutral| Okay. Important question. The note. Did you mean it?",
    "me| Mean what?",
    "hina blush| Your answer! On the note! It's a binding legal document! I keep all of them!",
    "| She pulls a little plastic folder out of her bag. It's full of folded triangles. Every one has a sunflower on it.",
    "hina happy| Notes from everyone I've ever been friends with. Daichi's are mostly drawings of sharks. Rei only ever writes 'no'.",
    "hina| You're in the folder now. Page one of the new section. No pressure.",
    "| She tucks it away very carefully, like it matters. I think it does.",
    "hina happy| You've got one of those faces, you know. A summer face. Like you'd be good at fireworks.",
    sfx("shutter"),
    fx("flash", "#fff", 350),
    "| A camera shutter. Everything goes white for a second.",
    show("hina", "neutral", "left"),
    show("rei", "neutral", "right"),
    "rei aim| Hold still. ...Okay, you blinked. Typical.",
    mem("p1"),
    "hina happy| Rei! You can't just photograph people without asking!",
    "rei| I can, actually. That's how candids work.",
    "rei| Kurosawa Rei. Photography club. Which is me. I'm the photography club.",
    "rei aim_close| Don't look so scared. I only keep the good ones.",
    "rei neutral| ...You're the transfer, right? Good. New face. I've photographed every face in this class four hundred times. Daichi has stopped making expressions.",
    "hina| Rei is secretly very nice.",
    "rei annoyed| Rei is not secretly anything. Rei is going to develop this and it's going to be a very unflattering blink.",
    "rei soft| ...I'll give you a copy. If it's good. Don't make it weird.",
    "| Before I can ask what that means, the speaker above the blackboard clicks on.",
    pa("Good afternoon, students. This is a reminder from the Office. Summer break begins in five days. Please enjoy your last week."),
    "me| The Office?",
    "rei| The Student Office. It does the announcements and the bells. Nobody's ever actually been in there. It's just the voice in the speakers.",
    "hina happy| Five days! Okay, {name}, we have to make the most of it. That's an order from your class rep.",
    "rei| She means it. She has a list.",
    "hina blush| I do NOT have a... okay, I have a small list.",
    "| There's an empty desk by the window. A sketchbook is still lying on it, closed.",
    "me| Whose seat is that?",
    "hina sad| Oh... that's Sayo's. Shiraishi Sayo. She's in the infirmary a lot. She gets... tired.",
    "rei| She draws. Really well. Kind of creepily well.",
    "hina worried| Rei.",
    "rei annoyed| What? It's a compliment.",
    // lunch
    clear,
    "| At lunch, Hina pushes three desks together around mine like she's building a fort, and a tall boy with a sunburnt nose sits on the fourth one backwards.",
    show("hina", "happy", "left"),
    show("rei", "neutral", "right"),
    "daichi| So THIS is the transfer student. Nakamura Daichi. I've lived next door to Hina since we were babies. Sorry in advance.",
    "hina happy| He's harmless. Mostly.",
    "daichi| Big news. Saturday. The beach. All of us. I made a map.",
    "| He unfolds a paper napkin. There's one wavy line for the sea, a big X, and the words BE THERE OR BE A LOSER.",
    mem("o2"),
    "rei| You drew the entire ocean as one line.",
    "daichi| It's called minimalism, Rei. Look it up.",
    menu([
      { text: "I'll be there.", do: [love("hina"), "daichi| A person of culture! Hina, I like this one.", "hina blush| I saw them first!"] },
      { text: "What's at the X?", do: ["daichi| Snacks. Sand. Destiny.", "rei| There's nothing at the X. There's never anything at the X."] }
    ]),
    "hina| Saturday's going to be perfect. I can feel it.",
    "daichi| Last year she said that and then we all got sunburnt. Tradition.",
    "rei| She fell asleep on the sand and woke up with a handprint on her stomach. Daichi drew a face on it in sunscreen.",
    "hina blush| We do NOT talk about the sunscreen face.",
    "daichi| It had a little moustache. It was art.",
    "| Hina throws a rice ball at him. He catches it in his mouth. Rei takes a photo at exactly the right second, and for a moment all three of them are laughing so hard nobody can breathe.",
    "| I've been at this school for three weeks. This is the first lunch I haven't eaten alone.",
    "hina happy| Hey. {name}. You're smiling.",
    "me| Am I?",
    "hina| Mm-hm. Good. Keep doing that. It suits you.",
    "| Hina laughs, and pulls a folded piece of notebook paper out of her blazer. She checks something off with a tiny, serious pen stroke.",
    "hina turn| Item one: make a new friend before summer. ...Check! Don't look at me like that. It counts.",
    mem("l1"),
    sfx("bell"),
    "| The bell rings. Last period is over, and the afternoon belongs to me.",
    set("day", 1),
    jump("a1_choice")
  ],

  a1_choice: [
    clear,
    fx("mood", null),
    bg("hallway"),
    music("day"),
    "| After class. The hallway is full of summer noise: lockers slamming, someone laughing about the beach.",
    "| Who should I spend the afternoon with?",
    menu([
      { text: "Walk home with Hina", do: [visit("hina", "", 4, SWEET_FIRST)] },
      { text: "Visit Rei in the darkroom", do: [visit("rei", "", 4, SWEET_FIRST)] },
      { text: "Check on Sayo in the infirmary", do: [visit("sayo", "", 4, SWEET_FIRST)] }
    ]),
    jump("a1_night")
  ],

  a1_night: [
    clear,
    when(v => v.day === 4, [jump("a1_night4")]),
    "| That night, my phone won't stop buzzing.",
    { t: "js", run: g => g.meta.phone({ title: "Summer Squad ☀", msgs: NIGHTS[Math.min(3, g.v.day)](g), note: "4 members" }) },
    when(v => v.day === 2, [
      "| Just before I fall asleep, one more buzz. Just Hina, just to me.",
      phone("Hina ☀", [
        ["hina", "hey. are you awake"],
        ["me", "I'm awake."],
        ["hina", "ok good. i just wanted to say today was really fun"],
        ["hina", "like REALLY fun. like top 5 days fun"],
        ["hina", "ok that's all. goodnight. sorry. goodnight!!"],
        ["hina", "(the rice ball is still in the fridge)"]
      ], "online"),
      "| I fall asleep with the phone on my chest, smiling at the ceiling like an idiot."
    ]),
    when(v => v.day === 3, [
      "| One more buzz. An email this time, from an address I don't remember giving anyone: office@hoshimi.ac.",
      "| Subject: ♡ How was your week? (1 minute) ♡",
      mini("survey"),
      mem("o10"),
      "| I put the phone down. For a second I think I hear the speaker in my room click, the way the one at school does before an announcement. I don't have a speaker in my room."
    ]),
    jump("a1_next")
  ],

  a1_night4: [
    "| Thursday night. My phone buzzes before I've even taken my shoes off. A number I don't have saved.",
    phone("+81 ··· ···· ····", [
      ["unknown", "is this K?"],
      ["me", "No. This is {name}."],
      ["unknown", "oh."],
      ["unknown", "sorry. you sound like them."],
      ["unknown", "don't stay up too late. they start counting when you stay up late."]
    ], "unknown number"),
    mem("o7"),
    "| When I try to call back, it says the number doesn't exist.",
    "| I lie on my bed and try to put it in order, the way you'd write down a dream before it goes.",
    "| One: the week is repeating. Today was Monday again, word for word. The same announcement. The same napkin map, not even creased.",
    "| Two: someone called K was here before me. K is rubbed out of Sensei's register. Hina called me K without noticing. And in Rei's photo, someone was standing behind my chair.",
    "| Three: Sayo knows more than she's saying. She said it's always Thursday when someone notices.",
    "| And tomorrow is supposed to be the last day.",
    "| My phone buzzes. The group chat is going off again.",
    phone("Summer Squad ☀", [
      ["hina", "METEOR SHOWER TONIGHT!!! 11pm!!! everyone look up!!! ☄"],
      ["daichi", "it's cloudy where i am"],
      ["rei", "it's cloudy everywhere. it's been cloudy since monday"],
      ["rei", "has anyone noticed it's been the same clouds since monday"],
      ["hina", "don't be weird rei 😤"],
      ["hina", "{name}!! look up for me ok?"]
    ], "4 members"),
    menu([
      { text: "Go to the window and look up", do: [
        "| I open the window. The clouds part just enough.",
        "| Stars. A lot of them. Then one falls, then three, then so many I lose count.",
        "| One of them falls the wrong way. Up.",
        phone("Summer Squad ☀", [["me", "I saw them."], ["hina", "ME TOO!!!! ☄☄☄"], ["hina", "list item six. CHECK. 😭♡"]], "4 members"),
        mem("l6")
      ] },
      { text: "Go to sleep", do: ["| I put the phone face down. Somewhere above the clouds, something falls, and nobody sees it."] }
    ]),
    jump("a1_next")
  ],

  a1_next: [
    clear,
    { t: "js", run: g => { g.v.day++; } },
    when(v => v.day === 2, [jump("a1_tue")]),
    when(v => v.day === 3, [jump("a1_wed")]),
    when(v => v.day === 4, [jump("a1_thu")]),
    jump("a1_fri")
  ],

  /* ---------- mornings: twenty minutes before homeroom ---------- */
  a1_morning: [
    clear,
    bg("riverside"),
    music("morning"),
    "| Morning. The cicadas have already started. I have about twenty minutes before homeroom.",
    menu([
      { text: "Stop by Amamiya Bakery", do: [visit("hina", "m")] },
      { text: "Take the long way, over the bridge", do: [visit("rei", "m")] },
      { text: "Cut through the courtyard, under the infirmary window", do: [visit("sayo", "m")] }
    ]),
    clear
  ],

  hinam1: [
    "| Amamiya Bakery is a narrow shop by the station with a hand-painted sign and a bell over the door that plays half a song.",
    "| The whole street smells like butter. There's a line out the door, and at the front of it, a very small boy is guarding the register.",
    show("hina", "happy", "center"),
    "hina| {name}! You came! Okay, don't panic, this is Sora. My brother. He's six. He's in charge of security.",
    show("sora", "neutral", "right"),
    "| Sora looks up at me with enormous serious eyes and a smear of custard on his cheek.",
    "| \"Are you a ninja?\" he asks.",
    menu([
      { text: "\"Yes. Don't tell anyone.\"", do: [love("hina"),
        "| Sora gasps so hard he has to hold onto the counter.",
        "| \"Ninja test,\" he whispers. \"Stand on one leg. For a whole minute. Don't fall.\"",
        "| I stand on one leg in the middle of Amamiya Bakery while the morning rush flows around me. A salaryman takes a croissant and pretends not to see.",
        "| Sora counts to sixty very slowly, skipping forty-four, then going back for it.",
        "| \"You passed,\" he says. \"Summer ninja. Level one.\"",
        mem("o9"),
        "hina blush| He's never given anyone level one. Daichi has been level zero for three years."] },
      { text: "\"No. Just a transfer student.\"", do: [
        "| Sora's face falls like I've told him summer is cancelled.",
        "hina| Sora, a transfer student is like a ninja. They appear out of nowhere and nobody knows their past.",
        "| He considers this. Then he hands me a melon bread with the dignity of a king handing over a sword."] }
    ]),
    "hina neutral| Dad says to take one for the road. Dad says that to everyone. Dad would give away the whole bakery if Mom let him.",
    "hina happy| Walk with me? It's on the way. Everything is on the way if you walk slowly enough.",
    "| We walk to school eating warm bread out of a paper bag. Hina talks the whole time. I don't mind at all."
  ],
  hinam2: [
    "| The bakery bell plays its half a song. Hina's dad waves at me from the back with a hand covered in flour, like we've known each other for years.",
    show("hina", "neutral", "center"),
    "hina| Morning! Look, look. Summer special. Dad makes it the last week every year.",
    "| She holds up a melon bread shaped like a sunflower, a little lopsided, the sugar on top glittering.",
    "hina happy| It's supposed to be a sunflower. Sora says it's a 'yellow octopus'. Sora is wrong. Sora is always wrong about art.",
    "hina neutral| Can I tell you something weird? Every year, Dad makes these on Monday. And every year, by Friday, I'm so sick of them I can't look at them.",
    "hina worried| But this year I feel like I've been sick of them for a really long time. Like... years. Isn't that weird? It's only Tuesday.",
    "me| It's not Tuesday, Hina.",
    "hina| ...Is it? Huh. See? Weird.",
    "| Behind the counter there's a paper calendar with a page for every day. Someone has been tearing the pages off. There's a thick stack of torn pages in the trash can underneath, much thicker than one week.",
    menu([
      { text: "Ask about the calendar", do: [
        "hina| Oh, that? Sora tears them off. He likes the sound.",
        "hina worried| ...There's a lot of them, isn't there.",
        "hina happy| He must be tearing off extra! For fun! Little gremlin."] },
      { text: "Split the sunflower with her", do: [love("hina"),
        "| I tear it in half. Hina gets the half with more petals and acts like I've given her a diamond.",
        "hina blush| You're not allowed to be this nice before eight in the morning. It's against the rules."] }
    ]),
    "| On the way out, the bell plays its half a song again. Hina hums the other half, like she's done it a thousand times."
  ],
  hinam3: [
    "| It's very early. The bakery isn't open yet, but the lights are on in the back, and the side door is propped open with a flour sack.",
    "| Hina is asleep at the counter with her head on her arms. There's a notebook under her elbow, open.",
    "| Every page is tally marks. Bundles of five, page after page, neat at first, then crooked, then pressed so hard the pen went through.",
    "| At the top of the last page, she's written: 'times I said good morning to {name}'.",
    "| There are a lot more than four marks.",
    show("hina", "worried", "center"),
    "hina| Mm... oh! {name}! What time is... I fell asleep. I was helping Dad with the dough and I just... sorry.",
    "| She sees where I'm looking. She closes the notebook very gently, like a door on a sleeping room.",
    "hina sad| It's nothing. It's a counting thing. I count stuff when I'm nervous. It's dumb.",
    menu([
      { text: "\"It's not dumb.\"", do: [love("hina", 2),
        "hina| ...You always say that.",
        "hina worried| I mean. You would. You seem like the kind of person who'd say that. That's what I meant."] },
      { text: "\"Why so many?\"", do: [
        "hina sad| I don't know. I really don't. I wake up and the marks are just there, and my hand hurts like I made them.",
        "hina| Can we not? Please. It's the last week. I want it to be a nice one."] }
    ]),
    "hina happy| Good morning, by the way. Officially.",
    "| She doesn't open the notebook. But I see her hand twitch toward a pen."
  ],
  hinam4: [
    show("hina", "happy", "center"),
    "| The bakery again. Sora salutes me from behind the register. I salute back. It's a whole thing now.",
    "hina| You keep coming here! Dad's going to start charging you rent. Or adopting you. Fifty-fifty.",
    love("hina"),
    "| We walk to school with bread, the way I think we always have."
  ],

  reim1: [
    "| The long way to school goes over the old iron bridge. The river underneath is low and glittering.",
    show("rei", "photo", "center"),
    "| Rei is standing in the exact middle of the bridge, camera up, completely still. She doesn't look at me.",
    "rei| Shh. Forty seconds.",
    "| A train crosses the rail bridge downstream, silver, right on time. The shutter clicks once.",
    "rei neutral| The 7:42. I shoot it every morning. Same spot, same second.",
    "rei| You'd be amazed what's different. The clouds. Somebody's bike. Once there was a dog on the platform wearing sunglasses. Best photo I've ever taken.",
    mem("p15"),
    menu([
      { text: "What's different today?", do: [love("rei"),
        "rei neutral| Third car. There's a man who reads the newspaper every morning. Today he's got a kid on his lap, reading it with him.",
        "rei soft| He's been on that train for two years and I've never seen him smile. He's smiling.",
        "rei| That's the shot. That's why you shoot every day."] },
      { text: "Can I be in tomorrow's?", do: [
        "rei laugh| Bold. No. It's a train series. You're not a train.",
        "rei| ...Stand by the railing tomorrow and we'll see. Maybe you're a little bit of a train."] }
    ]),
    "| We walk the rest of the way together. Rei doesn't talk much, but she points things out: a cat on a wall, the way the light hits the water. Like she's teaching me where to look."
  ],
  reim2: [
    show("rei", "neutral", "center"),
    "| Rei's on the bridge again. When she sees me, she holds out the camera without a word.",
    "rei| You try. It's not hard. Just look through here and wait for the thing you want.",
    "| The viewfinder is small and bright. The world through it looks more real than the world without it, somehow. Sharper at the edges.",
    "rei| See? Everything looks like it means something when you put a box around it.",
    "| A leaf drifts down the river, turning slowly in the current. I follow it in the viewfinder until it goes under the bridge.",
    "| Then another leaf. The same shape. Turning the same way. Going under the bridge at the same spot.",
    menu([
      { text: "Take the photo", do: [love("rei"),
        sfx("shutter"),
        "rei soft| Not bad. You waited. Most people don't wait.",
        "rei neutral| What did you shoot?",
        "me| A leaf. Twice.",
        "rei| ...Twice?"] },
      { text: "Hand it back", do: [
        "rei| Nothing worth it? Fair. Most mornings aren't. That's why I shoot every one, so I don't miss the one that is."] }
    ]),
    "| The 7:42 crosses downstream. In the third car, the man with the newspaper turns the page. No kid on his lap today. The same page as yesterday. Rei watches him the whole way, and doesn't take the picture."
  ],
  reim3: [
    show("rei", "annoyed", "center"),
    "| Rei is crouching on the bridge, retying her shoe. She holds the camera out to me without looking up.",
    "rei| Hold this. If you drop it, I will haunt you. I'll be the first ghost who can afford a lawyer.",
    "| Out of habit, I lift it and look through it at her.",
    fx("ghost", 900, 64),
    "| In the viewfinder, someone is standing behind Rei. Close. Close enough to touch her hair.",
    "| I lower the camera. There's nobody on the bridge but us.",
    "rei neutral| What? You've got a face.",
    menu([
      { text: "Tell her", do: [love("rei", 2),
        "rei| ...Behind me. Like in the prints.",
        "| She doesn't turn around. She takes the camera back and holds it against her chest.",
        "rei soft| Thanks for telling me. Most people would pretend they didn't see anything. That's worse. Pretending is always worse."] },
      { text: "\"Nothing. Sun in my eyes.\"", do: [
        "rei annoyed| Liar. You're a bad liar. It's one of your better qualities.",
        "| She takes the camera back. On the walk to school she checks behind her four times, and pretends she's looking at the sky."] }
    ])
  ],
  reim4: [
    show("rei", "photo", "center"),
    "| The 7:42. Rei, the bridge, the shutter. She nods at me like I'm part of the routine now.",
    "rei| You're in this one. Railing. Don't move. ...Okay, you're a little bit of a train.",
    love("rei"),
  ],

  sayom1: [
    bg("hallway"),
    "| The courtyard behind the school is empty this early. There's a vending machine humming to itself and a bench nobody sits on.",
    "| On the second floor, the infirmary window is open. The curtain moves.",
    "| Something white floats down and lands at my feet. A paper airplane.",
    "| Unfolded, it's a drawing. The courtyard bench, from above, with the cat asleep on it. Someone has drawn a tiny speech bubble coming out of the cat: 'good morning, transfer student.'",
    mem("s12"),
    "| When I look up, Sayo is leaning on the windowsill. She waves, small, with just her fingers.",
    show("sayo", "neutral", "center"),
    "sayo| Sorry. Was that weird? Hina talks about you very loudly in the hallway. I heard 'transfer student' about fifty times yesterday.",
    menu([
      { text: "Wave back", do: [love("sayo"),
        "sayo happy| ...Oh. You waved back. People don't usually see me up here.",
        "sayo| I'll keep the window open. In case."] },
      { text: "Fold it back into a plane and throw it up", do: [love("sayo"),
        "| It's a terrible throw. It loops twice and lands on the vending machine.",
        "sayo happy| ...Pfff.",
        "| She covers her mouth with both hands. Her shoulders shake. Sayo Shiraishi is laughing at me, and it is the best thing that's happened all morning."] }
    ]),
    "| The bell rings. When I look up again, the curtain's closed, and the window is just a window."
  ],
  sayom2: [
    bg("hallway"),
    "| Sayo is in the courtyard this morning. Actually in it, standing by the vending machine in her indoor shoes, squinting like the sun is a very loud noise.",
    show("sayo", "scared", "center"),
    "sayo| I came down. Nurse Mori was asleep. I've never... I didn't know the morning was this color.",
    "sayo neutral| From up there it's grey. Down here it's sort of gold. Nobody told me.",
    "| I buy two cans of something peach-flavored from the machine. She holds hers with both hands and doesn't open it, like it's a present.",
    "sayo| The paper plane, the other morning. I didn't aim it. It landed right at your feet anyway. I think I knew where you'd be standing. I don't know how I knew.",
    "sayo| Can I tell you something else I noticed? Count the windows on the second floor.",
    "| I count. Eight windows.",
    "sayo| There are seven rooms on the second floor. I checked every door. Seven.",
    "sayo| There's a window for a room that isn't there.",
    know("room0"),
    menu([
      { text: "\"Let's go look for it.\"", do: [love("sayo"),
        "sayo scared| No. Not yet. ...Not this week.",
        "sayo neutral| But thank you for saying 'let's'. Like it's something we'd do together."] },
      { text: "\"Maybe it's a closet.\"", do: [
        "sayo| Maybe. A closet with a window. That nobody's ever opened.",
        "sayo sad| I think something lives in there. Something that has never had a morning either."] }
    ]),
    "sayo twirl| I'm going to keep the can. Not drink it. Just keep it. So I remember this one was real."
  ],
  sayom3: [
    bg("hallway"),
    "| The infirmary window is open again. No airplane this time. Just a page of the sketchbook, taped to the outside of the glass, facing out. Facing me.",
    "| It's a drawing of a menu. Four rounded buttons in a column: NEW GAME. LOAD. SETTINGS. QUIT.",
    "| Next to them, a fifth shape, only half drawn. The outline of something tall, with a little circle where a handle would be.",
    show("sayo", "draw", "center"),
    "sayo| You saw it. Good.",
    "sayo neutral| I don't know what it is yet. I keep drawing it and it isn't finished. I think it's not allowed to be finished yet.",
    "sayo| When I close my eyes, those four buttons are there. And three people standing behind them, very still. And music. And then I wake up here.",
    menu([
      { text: "\"What happens if you finish it?\"", do: [love("sayo", 2),
        "sayo| I think it opens.",
        "sayo happy| I'd like to see what's on the other side. Wouldn't you?"] },
      { text: "\"Maybe it's just a dream.\"", do: [
        "sayo| Maybe. My dreams are very specific, then. They have a settings menu."] }
    ]),
    "| She peels the page off the glass and takes it back inside. The tape leaves four little marks on the window, like a frame around nothing."
  ],
  sayom4: [
    bg("hallway"),
    show("sayo", "happy", "center"),
    "| The window's open. Sayo waves first this time, before I even look up.",
    "sayo| Morning. I saved you a peach can. I've been saving them. I have four now. It's a collection.",
    love("sayo"),
  ],

  a1_tue: [
    day("Tuesday", "Four days until summer break."),
    call("a1_morning"),
    bg("classroom"),
    music("day"),
    show("rei", "neutral", "center"),
    "rei photo| Hey. Transfer. C'mere. Hold out your hand.",
    "| Rei puts a small black-and-white print on my palm, face down, like a playing card.",
    "rei| Yesterday's. I said I'd give you a copy if it was good.",
    "| I turn it over. It's me, mid-blink, mouth half open, Hina's elbow in the corner of the frame. It is not good. It is the worst photo of me that has ever existed.",
    "rei laugh| It's perfect. It's the most honest photo I've taken all year.",
    menu([
      { text: "\"Burn it.\"", do: ["rei| Never. It's going on the wall. Next to Daichi's sneeze. You're in the hall of fame now.", "rei soft| ...That's a compliment, by the way. The wall is only for people I like."] },
      { text: "\"Can I keep it?\"", do: [love("rei"), "rei| ...You actually want it?", "rei soft| Huh. Okay. Nobody ever keeps the ones I give them. They say thanks and it ends up in a drawer.", "rei| Put it somewhere you'll see it. That's the rule. Photos die in drawers."] }
    ]),
    show("hina", "happy", "left"),
    "hina| Morning! Ooh, is that the blink? Let me see let me see let me— oh no. Oh, {name}. Oh, sweetie.",
    "rei| I know. It's art.",
    "hina happy| It's going in the folder. Next to the note. Rei, make me a copy.",
    "rei annoyed| I'm a photographer, not a printer.",
    "| She makes her a copy anyway. I see it on Hina's desk at the end of the day, tucked carefully into the plastic folder of sunflower notes.",
    // second period: home ec
    clear,
    "| Second period is home economics. We're supposed to be making onigiri. Kanda-sensei is supposed to be supervising. Kanda-sensei is asleep in a chair by the window with a cookbook over her face.",
    show("hina", "happy", "left"),
    show("rei", "neutral", "right"),
    "hina| Okay, partners! {name}, you're with me. Rei's with Daichi. Rei, don't let him put chocolate in it.",
    "daichi| One time. ONE time.",
    "| Hina shapes her rice balls into perfect triangles without even looking. Mine come out shaped like small sad potatoes.",
    menu([
      { text: "Ask her to teach you", do: [love("hina"),
        "hina blush| Oh! Okay. Um. Hands like this. No, wet them first. Like... here.",
        "| She puts her hands over mine and shapes the rice with me, press, turn, press. Her hands are warm. Her ears go very red.",
        "hina| ...There. A triangle. Sort of. It's a little bit of a triangle.",
        "me| It's a perfect triangle.",
        "hina happy| It's a terrible triangle and I love it. I'm eating it. You can't stop me."] },
      { text: "Make one shaped like a cat", do: [
        "| It takes me ten minutes and two bits of seaweed for ears. It looks like a cat if you squint. It looks like a cat if you really, really want it to.",
        "hina happy| It's a cat! It's a CAT! Rei, take a picture of the cat!",
        sfx("shutter"),
        "rei| Documented. For the record, it looks like a ghost.",
        "hina| It's a cat ghost. Even better."] }
    ]),
    "| At the next table, Daichi has managed to make a single onigiri the size of a softball. He eats it like an apple, triumphant. Rei photographs him from four angles.",
    "| The whole room smells like warm rice and summer. Sensei snores softly under her cookbook. I don't think I've ever been this happy in a classroom.",
    // lunch on the roof
    clear,
    bg("rooftop"),
    "| At lunch Hina leads all of us up a staircase that says NO STUDENTS BEYOND THIS POINT, through a door with a broken lock.",
    show("hina", "happy", "left"),
    show("rei", "neutral", "right"),
    "hina| Ta-da! The roof! Technically illegal. Spiritually required.",
    "daichi| Hina's been coming up here since first year. The lock's been broken since first year. I'm not saying those are related.",
    "| The whole town is spread out below us, glittering. You can see the river, and past it, a thin blue line that might be the sea.",
    "hina| Okay, bento trade! I have my dad's tamagoyaki. It's famous. Like, regionally.",
    "rei| It's legitimately good. I'm not even being nice. I'm never nice.",
    menu([
      { text: "Trade with Hina", do: [love("hina"), "| It's sweet and fluffy and still a little warm. Hina watches me eat it like she's waiting for a verdict.", "hina blush| ...Well?", "me| It's really good.", "hina happy| I KNEW it. Dad's going to be unbearable."] },
      { text: "Ask Rei to take a group photo", do: [love("rei"), "rei| ...You want to be in a photo? On purpose?", "rei laugh| Fine. Everybody squish. Daichi, you're blocking the sky.", sfx("shutter"), fx("flash", "#fff", 300), mem("p7"), "rei soft| ...That one's going on my wall."] }
    ]),
    "hina| Item seven! Lunch on the roof with everyone. Check!",
    mem("l7"),
    "hina list| Okay, everybody. Important business. The list has twelve items, and twelve is a boring number.",
    "hina| So! There's space at the bottom. Item thirteen. {name}, you write it. Something you want to do this summer. Anything.",
    "daichi| Why do they get to write one? I've known you for sixteen years.",
    "hina| Because you'd write 'beat Hina at something' and that's just item eight backwards.",
    "daichi| ...That is exactly what I was going to write.",
    "| She hands me the list and her pen, a pink one with a little plastic sunflower on the end. The paper is soft from being folded so many times.",
    mini("ask", { title: "Hina's summer list", hint: "13. Something you want to do this summer. Anything.", placeholder: "eat watermelon on a roof", key: "item13", max: 40, who: "hina" }),
    mem("l13"),
    when(v => v.askRefused, [
      "hina| There. Item thirteen: '{item13}.' My handwriting. Your fault.",
      "daichi| What did they write? Let me see.",
      "hina| NOTHING. Nothing you need to see, Daichi."
    ], [when(v => v.askKind !== "ok", [
      "hina sad| '{item13}.' ...Okay. It's on the list now. In pen. I hope you're happy."
    ], [
      // With the local AI on, Hina answers what you actually wrote. Otherwise she says what she always says.
      show("hina", "close"),
      aiSay("hina", "close", g => `The player, ${g.name()}, wrote "${g.meta.vars().item13}" as item 13 on Hina's summer list. Hina loves it, says exactly what they wrote back to them, and says it goes on the list forever, in pen.`,
        "'{item13}.' ...I love it. It's going on the list forever. In pen. No take-backs.", { include: g => g.meta.vars().item13 })
    ])]),
    "rei| You do realize she's going to make you actually do it.",
    "hina| Every single item gets done this year. Including thirteen. ESPECIALLY thirteen.",
    "rei neutral| Not everyone's here, though. We should invite Shiraishi sometime.",
    "hina happy| YES. Sayo! On the beach! She'd love it. I'll bring her a hat. A big one. With a ribbon.",
    "daichi| The quiet girl? She lent me an eraser once, in first year. It had a little cat drawn on it. I never gave it back.",
    "rei| You stole a sick girl's cat eraser.",
    "daichi| I BORROWED it. For two years. It's very sentimental now.",
    "| Hina writes something tiny in the margin of the list. 'Invite Sayo!! (hat)'. She draws a little hat next to it, with a ribbon.",
    "| We lie on our backs on the warm concrete after we eat, all four of us in a row, and nobody says anything for a while.",
    "| The clouds go by very slowly. One looks like a rabbit. Daichi says it looks like a hamburger. Hina says everything looks like a hamburger to Daichi.",
    menu([
      { text: "\"That one looks like Hina.\"", do: [love("hina"),
        "hina| Which one? The cute one?",
        "me| The one that won't stop moving.",
        "hina blush| ...Rude. Accurate. Rude."] },
      { text: "\"That one looks like a camera.\"", do: [love("rei"),
        "rei| ...It does, actually. Huh.",
        "| Rei lifts her real camera and photographs the cloud camera. It's the softest I've ever seen her look.",
        "rei soft| Camera taking a picture of a camera. That's going on the wall too."] },
      { text: "Say nothing. Just watch.", do: [
        "| Nobody needs to say anything. The sun is warm. Somewhere below us a bike bell rings. Hina hums a song I don't know.",
        "| It's the kind of moment you know you'll remember even while it's happening."] }
    ]),
    "hina| Hey, everyone? I'm really glad this is our last week. I mean... I'm glad it's this one. With all of you.",
    "daichi| Gross. Sincere. Ew.",
    "| But he's smiling. Everyone is.",
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_wed: [
    day("Wednesday", "Three days until summer break."),
    call("a1_morning"),
    bg("classroom"),
    music("day"),
    "sensei| Roll call. Amamiya. Kurosawa. Nakamura. Don't say 'yo'. Shiraishi... no. And {name}.",
    "| She turns the register around to mark me, and for the first time I see the page properly.",
    "| One line near the bottom has been erased so many times the paper has gone thin. I can still make out a single letter. K.",
    mem("o1"),
    "sensei| Hm? Oh, that. Old smudge. That register is older than I am.",
    "| She says it lightly. But she rubs her thumb over the thin spot, once, like she's checking it's still there.",
    show("hina", "happy", "center"),
    "hina list| Item eight on the summer list: beat Daichi at something. Item nine: see the ocean. On Saturday, at the beach.",
    "hina| You're coming, right, K?",
    fx("flicker", 420),
    subliminal("h_classroom", 110),
    fx("glitch", 300),
    "| ...K?",
    "hina worried| Huh? I said your name. {name}. ...Didn't I?",
    show("rei", "neutral", "right"),
    "rei| You said 'K'.",
    "hina sad| I... that's so weird. I don't know anyone called K.",
    "| Hina laughs, but she keeps glancing at the list in her hands, like it might have changed while she wasn't looking.",
    log("hina", "who is K? why do i keep writing it"),
    { t: "js", run: async g => { if (await g.meta.writeFile("hinas_summer_list.txt", HINA_LIST_1)) persist.set("wroteList", true); } },
    // lunch: the melon bread war
    clear,
    "| Lunch. There is exactly one melon bread left at the school store, and Daichi and I reach for it at the same time.",
    show("hina", "happy", "left"),
    "daichi| Oh, it's ON. Rock paper scissors. One round. Winner takes the bread. Loser carries everyone's bags on Saturday.",
    "hina| Ooh! Item eight! Beat Daichi at something! {name}, this is your moment!",
    "| Hina leans in close and whispers, very fast:",
    "hina lean| He always throws rock first. Always. Since kindergarten. He thinks nobody's noticed.",
    "daichi| Ready? Rock... paper... scissors...",
    menu([
      { text: "Rock", do: ["daichi| Rock! Tie! Again! ...Rock!", "| He throws rock again. I throw scissors without thinking. He wins.", "daichi| THE BREAD IS MINE.", "hina sad| Nooo. You had him."] },
      { text: "Paper", do: [love("hina"), "daichi| ROCK! ...wait.", "| Paper covers rock. Daichi stares at his own fist like it betrayed him.", "daichi| How did you... HINA.", "hina happy| I didn't say anything! Item eight! CHECK!", mem("l8"), "| The melon bread is still warm. I split it in half and give Hina the bigger piece. She pretends not to be thrilled."] },
      { text: "Scissors", do: ["daichi| ROCK! Rock beats scissors! Rock beats EVERYTHING!", "rei| Rock does not beat everything.", "hina sad| I literally told you..."] }
    ]),
    show("rei", "neutral", "right"),
    "rei| For the record, I've photographed Daichi throwing rock two hundred and eleven times.",
    "rei annoyed| ...Which is weird. I've only known him three years.",
    "rei photo| Also. Transfer. I developed the rest of Monday's roll last night. Look at the blink again. Properly.",
    "| She lays the print from Monday on the table. Me, mid-blink, Hina's elbow in the corner. The photo I've been keeping where I can see it.",
    "rei| Behind you.",
    fx("ghost", 1600, 62),
    "| There's someone standing behind my chair. Blurred, like they moved during the whole exposure. No face. Just a shape in our uniform.",
    "| It wasn't there yesterday. I'm sure it wasn't there yesterday.",
    mem("p2"),
    "rei shocked| I didn't see anyone. Did you?",
    menu([
      { text: "It's probably a double exposure.", do: ["rei annoyed| Yeah. Old film does that. Probably. ...Probably."] },
      { text: "...Who is that?", do: [love("rei"), "rei| No idea. But you're the first person who didn't tell me it's a smudge."] }
    ]),
    "hina| We should show Sayo! She draws people from memory. Maybe she'd know.",
    "daichi| Who?",
    "| Daichi says it so easily. Not mean. Just honestly blank, like she's a word he's never heard.",
    "hina worried| ...Sayo, Daichi. She sits by the window. You borrowed her cat eraser. You told us yesterday.",
    "daichi| Huh. Yeah. Sure. Sayo. ...Is there a seat by the window?",
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_thu: [
    day("Thursday", "Five days until summer break.", true),
    call("a1_morning"),
    bg("classroom"),
    music("day"),
    pa("Good afternoon, students. This is a reminder from the Office. Summer break begins in five days. Please enjoy your last week."),
    fx("mood", "wrong"),
    "| ...Five?",
    show("hina", "happy", "left"),
    "hina| Five days! Okay, {name}, we have to make the most of it. That's an order from your class rep.",
    show("rei", "neutral", "right"),
    "rei| She means it. She has a list.",
    "| Word for word. The same as Monday.",
    know("loop"),
    "daichi| Big news. Saturday. The beach. All of us. I made a map.",
    "| He unfolds the same napkin. The same wavy line. The same X. The napkin isn't even creased; it's brand new.",
    "me| Hina. It's Thursday. Yesterday it was three days.",
    "hina neutral| Huh? No it isn't, silly. It's...",
    "hina worried| ...It's...",
    "| Rei is staring at her photos. She doesn't say anything at all.",
    music(null),
    "| The seat by the window isn't empty anymore.",
    show("sayo", "blank", "center"),
    mem("s5"),
    "sayo| ...It's always Thursday when someone notices.",
    when(v => (v.seen.sayo || 0) > 0,
      ["sayo neutral| You came to see me before. You still remember me. ...Good. That's new."],
      ["sayo neutral| Hi. I'm Sayo. You don't have to remember me. Nobody does."]),
    "sayo| There's a door next to the menu. I'm still drawing it. You'll see it after.",
    "sayo| Please come to the infirmary today. Before Friday.",
    "| Nobody else in the class has turned around. It's like they can't see her.",
    sfx("bell"),
    jump("a1_choice")
  ],

  /* ---------- Hina ---------- */
  hina1: [
    bg("riverside"),
    music("evening"),
    show("hina", "happy", "center"),
    "| Hina walks me home along the river. The sun is huge and orange and the cicadas are going crazy.",
    "hina| This is the best walk in town. Officially. I did a survey. The survey was me.",
    "hina neutral| My family runs the bakery by the station. Amamiya Bakery. If you ever smell melon bread at six a.m., that's us. Sorry.",
    "hina happy| My little brother Sora wants to meet you, by the way. I told him about you. He's six. He asked if you're a ninja.",
    "hina| So! Summer. What's the plan, {name}? Big ambitions? Secret dreams?",
    menu([
      { text: "See the ocean.", do: [love("hina"), "hina happy| The ocean! That's on my list too! Item nine! We're the same person!"] },
      { text: "Sleep until noon.", do: ["hina happy| Ha! Item two! I'm checking it off for you in advance. Now you HAVE to do it. Contracts are binding.", mem("l2")] },
      { text: "Spend it with you.", do: [love("hina", 2), "hina blush| W-wow, okay, straight for the heart. Somebody warn me next time."] }
    ]),
    "hina neutral| I've lived in this town my whole life. Every year I make a summer list, and every year summer goes so fast I never reach the end of it.",
    "hina| This year I'm going to finish it. All of it. Even the hard ones.",
    "| A stray cat is sitting on the river wall, orange like the sun. Hina stops dead.",
    "hina happy| Oh. Oh, it's HIM. That's Mister Butter. He lives on this wall. He's the mayor of the river.",
    "| Mister Butter looks at me like I'm a tax he didn't approve.",
    menu([
      { text: "Offer him your hand", do: [love("hina"),
        "| He sniffs my fingers for a very long time. Then he headbutts my palm, hard, and starts purring like a small engine.",
        "hina blush| He's never done that for anyone. Not even me. I've been bribing him with bread for four years.",
        "hina happy| Okay, that settles it. Mister Butter approves. You're officially part of the river now."] },
      { text: "Keep your distance", do: [
        "hina| Smart. He bit Daichi once. Daichi deserved it, but still.",
        "| Mister Butter yawns, enormous, and goes back to sleep in the sun."] }
    ]),
    "| We walk on. The cicadas get louder, then quieter, like the whole riverbank is breathing.",
    "hina neutral| You know what's funny? I was so nervous to talk to you. For three whole weeks.",
    "hina blush| And now it feels like I've known you forever. In a good way! In a normal, good, totally normal way.",
    "| She swings her bag and walks a little closer to me than she needs to. Our shadows on the path are so long they're holding hands, even though we aren't."
  ],
  hina2: [
    bg("riverside"),
    music("evening"),
    "| Hina insists on stopping at the konbini by the bridge. The bell over the door jingles.",
    "okada| Oh, Hina-chan. Same as yesterday?",
    "| A small old woman behind the counter is already holding out two popsicles. Soda flavor. Before anyone has said a word.",
    "hina happy| Mrs. Okada, you're psychic! This is {name}. New friend. Very important. Treat them well.",
    "okada| Ah, a new face. ...Hm. No. I've seen you before, dear. Same as yesterday.",
    mem("o3"),
    "| We eat them on the bridge, too fast, and get brain freeze at exactly the same moment.",
    "hina turn| Item four! Popsicles by the bridge! Check!",
    mem("l4"),
    show("hina", "neutral", "center"),
    "hina list| Okay, don't laugh. This is the list.",
    "| It's a folded piece of notebook paper, soft and yellow at the creases. Much older than this week.",
    "hina| I found it in my desk. It's my handwriting. ...Mostly.",
    "| I read down. Sparklers. Popsicles. The ocean. And then, at the very bottom, in handwriting that isn't quite hers:",
    "| 12. Don't let K leave.",
    "hina list_sad| I don't remember writing that one.",
    menu([
      { text: "Maybe you wrote it half asleep.", do: ["hina happy| Yeah! Totally. I write weird stuff half asleep. Once I wrote 'buy more moon'."] },
      { text: "Who's K?", do: [love("hina"), "hina sad| I don't know. But every time I read it, my chest hurts. Like I forgot someone really important."] }
    ]),
    "hina neutral| Anyway! You're officially a friend now. No refunds."
  ],
  hina3: [
    bg("riverside"),
    music("evening"),
    show("hina", "lean_blush", "center"),
    "| By the time we reach the river the sky is purple. Hina pulls a little paper packet out of her bag like a magician.",
    "hina| Senko hanabi! The tiny sparklers. Dad hides them every year and I find them every year.",
    "| We crouch on the steps by the water. The sparklers hiss and spit little orange flowers into the dark. Hina's face lights up in pieces.",
    "hina happy| The trick is to hold perfectly still. If you move, the ball drops. If you stay still, it lasts forever.",
    mem("l3"),
    "hina| Item three. Sparklers by the river. ...Check.",
    "hina lean_blush| {name}... can I ask you something?",
    "hina| Saturday, at the beach. Will you watch the fireworks with me? Just... us?",
    menu([
      { text: "Yes. Just us.", do: [love("hina", 2), "hina happy| Okay! Okay. Good. I'm going to be normal about this. I'm being completely normal."] },
      { text: "Let's all go together.", do: ["hina happy| Of course! Everyone! That's what I meant. Obviously."] }
    ]),
    "| Her sparkler's little ball of fire drops into the river with a tiny hiss.",
    "hina sad| Promise you'll still be here on Saturday?",
    "me| Where would I go?",
    "hina| People leave. ...That's all."
  ],
  hina4: [
    bg("riverside"),
    music("evening"),
    show("hina", "neutral", "center"),
    "| Hina drags me to the school pool after class. It's officially closed for the summer. The gate is officially unlocked.",
    "hina| Okay. Item five. Learn to swim properly. For real this time. I need a witness, or it doesn't count.",
    "| She sits on the edge with her feet in the water for a long time before she slides in, holding the side like it might leave.",
    "hina worried| I can swim. Kind of. I just don't like it when I can't touch the bottom.",
    "hina sad| Daichi pushed me in off the pier when we were eight. As a joke. I've been a bit scared of deep water ever since.",
    "hina| He felt terrible. He still buys me a popsicle every time we walk past the pier. I've never told him I forgave him years ago. Free popsicles.",
    menu([
      { text: "I've got you. Let go.", do: [love("hina", 2), "| She lets go of the wall. Then she lets go of my hand. Then she's floating, on her own, staring up at the sky like she can't believe it.", "hina happy| I'm doing it! I'm DOING it! Item five! CHECK!", mem("l5")] },
      { text: "We can try again tomorrow.", do: ["hina neutral| ...Yeah. Tomorrow. There's always tomorrow, right?", "| She says it like a question she's asked a lot of times."] }
    ]),
    "| We sit on the warm concrete afterwards, dripping, sharing the last popsicle.",
    "hina happy| You're really good at summer, you know. Like, suspiciously good.",
    "hina blush| ...I'm really glad you transferred here. Even if it was the last week. Especially if it was the last week."
  ],

  /* ---------- Rei ---------- */
  rei1: [
    bg("darkroom"),
    music(null),
    show("rei", "neutral", "center"),
    "| The darkroom smells like vinegar and is lit entirely red. Rei is rocking a tray of developer back and forth.",
    "rei| Close the door. Light kills everything in here.",
    "rei photo| This was my grandpa's camera. It's older than both of us put together. It doesn't even need batteries.",
    "rei| I only shoot film. Digital remembers too much. Film forgets on purpose.",
    menu([
      { text: "Why photography?", do: [love("rei"), "rei| Because things change when you're not looking. People leave. Rooms get repainted. A photo's proof that they were really there once."] },
      { text: "Can I see your photos?", do: ["rei laugh| Bold. Fine. Don't touch the wet ones."] }
    ]),
    mem("p3"),
    "| Prints hang along the strings: the school gate, the pool, Hina laughing with her mouth full, Daichi asleep on a desk with a pencil up his nose. Dozens. Hundreds.",
    "| In the middle of the wall, at eye level, there's a photo of a dog on a train platform wearing sunglasses. It has its own little frame.",
    "rei soft| Don't. Don't say anything about the dog. The dog is sacred.",
    "rei| Here. Rock this tray. Slowly. Like you're rocking a baby that's made of chemicals.",
    "| I rock the tray. Slowly, the white paper goes grey, and then a picture swims up out of nothing: the school gate this morning, with the light coming through the trees.",
    "rei neutral| That part never gets old. Nothing, nothing, nothing, and then something. Like it was there all along and just decided to show up.",
    "rei soft| ...You've got a good rocking hand. Steady.",
    "rei annoyed| Anyway. You can come back, if you want. Nobody else likes the smell. Don't make it a big deal."
  ],
  rei2: [
    bg("darkroom"),
    show("rei", "shocked", "center"),
    "rei| It's in every roll.",
    "| She pins up a row of prints. In every one, somewhere in the back, there's the same blurred shape in our uniform.",
    "rei| Always behind someone. Usually behind you.",
    "| In the last print, it's close enough to see a lanyard around its neck. The name card has one letter on it. K.",
    "rei neutral| Hina's list says 'don't let K leave'. Sensei's register has a K rubbed out of it. And now this.",
    menu([
      { text: "That's terrifying.", do: ["rei annoyed| Thank you. Finally. A normal reaction."] },
      { text: "Then let's find out who it is.", do: [love("rei", 2), "rei soft| ...You're really weird, you know that? Okay. Partners.", mem("p4")] }
    ]),
    "rei| I'm going to keep shooting. If it's going to stand behind people, it's going to stand behind people in focus."
  ],
  rei3: [
    bg("darkroom"),
    show("rei", "neutral", "center"),
    "rei aim| Stand there. No, there. Closer. I'm not going to bite.",
    sfx("shutter"),
    fx("flash", "#ffdddd", 300),
    "| She develops it right away. The two of us float up out of the white paper.",
    "rei photo_soft| Look. We came out.",
    mem("p5"),
    "rei neutral| ...Mostly. It's weird. Everyone else is always sharp. But I can never get you in focus.",
    "rei| You're blurred at the edges. Like you're not completely here.",
    menu([
      { text: "I'm here.", do: [love("rei", 2), "rei soft| Yeah. ...Yeah, I know. Stay sharp for me, okay? At least until summer."] },
      { text: "Maybe your camera's broken.", do: ["rei laugh| Wow. Romance is dead. Okay, get out of my darkroom."] }
    ]),
    "rei| I photograph everybody, you know. Every day. Hina thinks it's a hobby.",
    "rei soft| It's not. I just want proof that you were all here. In case one day you aren't."
  ],
  rei4: [
    bg("darkroom"),
    show("rei", "neutral", "center"),
    "rei| Okay. New project. Wall of shame. You, doing the stupidest pose you can think of. For science.",
    menu([
      { text: "Do a dramatic anime pose", do: ["| I do the most dramatic pose I know. Rei makes a sound I didn't know she could make."] },
      { text: "Make Rei pose too", do: [love("rei"), "rei annoyed| Absolutely not. I'm behind the camera. That's the whole point of— okay fine. FINE. Timer."] }
    ]),
    sfx("shutter"),
    fx("flash", "#fff", 300),
    "rei laugh| Oh no. Oh no, this is so bad. I'm— hang on. I can't breathe.",
    "| She laughs until she has to sit on the floor of the darkroom. When the print comes up, she's in it too, mid-laugh, a blur of hair.",
    mem("p6"),
    mem("l10"),
    "rei laugh| This one's going on the wall of shame. Forever. Sorry, I don't make the rules.",
    "rei soft| ...Hey. Don't tell Hina, but that's the first photo of me laughing that I've ever kept."
  ],

  /* ---------- Sayo ---------- */
  sayo1: [
    bg("infirmary"),
    music(null),
    "| The infirmary smells like clean sheets. A woman in a white coat looks up from her desk, startled, like she wasn't expecting anyone ever again.",
    "nurse| Oh! A visitor. Are you hurt? Dizzy? ...Oh. You're here for... for...",
    "| Her eyes slide to the far bed, then to the sign-in book on her desk, then back to me.",
    "nurse| I'm sorry. I always forget her name. Isn't that awful? She's here every single day.",
    show("sayo", "draw", "center"),
    "| A girl with long silver hair is sitting on the far bed, sketching. She jumps when I come in.",
    "sayo neutral| Oh. It's you. ...I mean. Hello.",
    "sayo| I'm Sayo. Sorry. I don't get a lot of visitors.",
    mem("l11"),
    menu([
      { text: "What are you drawing?", do: [
        "| She hesitates, then turns the sketchbook around. It's the view from the infirmary window: the courtyard, the vending machine, a cat asleep on the bench.",
        "| Every leaf on the tree is drawn separately. There must be a thousand of them.",
        "sayo happy| The cat comes every day at three. I've drawn him forty-one times. He doesn't know he's famous.",
        "sayo| ...You can have one. If you want. I have a lot of the cat."
      ] },
      { text: "Are you sick?", do: [love("sayo"), "sayo| Not sick. Just tired. Some days feel very long. Like I've lived them more than once."] }
    ]),
    "sayo| Nurse Mori is nice. She brings me tea. She asks my name every morning.",
    "| Nurse Mori brings two cups of barley tea and a plate of rice crackers shaped like little fish. Sayo eats hers tail first, very seriously.",
    "sayo| You have to eat them tail first. Then they don't see it coming.",
    "me| That's dark, Sayo.",
    "sayo happy| ...Mm. A little.",
    "| It's the first time I've seen her smile. It's small and surprised, like she found it in a pocket.",
    "sayo happy| ...Thank you for visiting. You can come back. If you want. I'll save you a fish."
  ],
  sayo2: [
    bg("infirmary"),
    "| Sayo's sketchbook is open on the bed when I come in. It's our classroom... drawn from somewhere that isn't a seat. From above, and in front of everything.",
    "| Along the bottom of the page, she's drawn a long dark box with lines of tiny words in it. 'There's always one,' she's written underneath.",
    mem("s1"),
    "| Nurse Mori isn't at her desk. Her sign-in book is lying open.",
    "| Every line on the page says the same thing, in the same handwriting: Shiraishi Sayo. Tired. I turn the page. Same. And the next. The dates go back years.",
    "| Every single date is this week.",
    mem("o4"),
    show("sayo", "neutral", "center"),
    "sayo| You read the book. It's okay. I read it too, sometimes. It's like a diary somebody else keeps for you.",
    "sayo| Can I tell you something strange?",
    "sayo| I think the week is a circle.",
    "sayo| Every time it gets to Friday, the sun goes down and then it's Monday again. Everyone forgets. I don't.",
    "sayo sad| It isn't a gift. I think I'm just... badly made.",
    menu([
      { text: "I believe you.", do: [love("sayo", 2), "sayo happy| ...Oh. Nobody has ever said that. Not once. Not in any of them."] },
      { text: "You should rest.", do: ["sayo sad| That's what you said last time too. It's okay. I know."] }
    ]),
    "sayo draw_happy| Hold still. I want to remember your face this time.",
    "| She draws for a long time without talking. The pencil sounds like rain.",
    mem("s2")
  ],
  sayo3: [
    bg("infirmary"),
    show("sayo", "neutral", "center"),
    "sayo| I want to show you one I don't show anybody.",
    "| She opens the sketchbook to a page near the back. Three girls are standing in a row, perfectly straight, smiling at nobody. Under their feet, five small rectangles in a row.",
    "| One of the girls has a sunflower clip. One of them is holding a camera. The third one is Sayo.",
    "sayo| This is where we wait. When nobody's here. We have to stand very still and smile, and there's music, and it never ends.",
    "sayo| You've been there. You were just there, before you came in. You just didn't know it was a place.",
    mem("s3"),
    "| Sayo presses a folded square of paper into my hand.",
    "sayo| Don't read it yet. Read it when it stops being summer.",
    "| When she closes the sketchbook, the pages fan past. The same drawing of a door, over and over. On every page, it's open a little wider.",
    mem("s4"),
    "sayo sad| And if Friday comes and I'm... different... it isn't your fault.",
    menu([
      { text: "I won't let anything happen to you.", do: [love("sayo", 2), "sayo happy| You can't promise that. But I like that you said it."] },
      { text: "What do you mean, different?", do: ["sayo blank| ...", "sayo neutral| Nothing. Forget it. Please."] }
    ])
  ],
  sayo4: [
    bg("infirmary"),
    show("sayo", "neutral", "center"),
    "| We sit by the window. Nurse Mori brings us tea and a whole plate of fish crackers, and winks at me on her way out like we're in on something.",
    "sayo| She's never brought the big plate before. I think she likes you.",
    "| Down in the courtyard, the three o'clock cat arrives exactly on time and flops onto the bench. Sayo opens her sketchbook without looking, and draws him in eight lines.",
    "sayo happy| Forty-two.",
    menu([
      { text: "\"Can you draw me?\"", do: [love("sayo"),
        "sayo| ...You'd have to sit still.",
        "me| I can sit still.",
        "| I can't. Every time she looks up at me, I want to laugh, and every time I laugh, she hides behind the sketchbook and laughs too.",
        "| In the end she draws me laughing. She says it's the only way I'll hold still: if she draws the moving."] },
      { text: "\"Name the cat.\"", do: [
        "sayo| He has a name. It's Professor.",
        "me| Professor?",
        "sayo happy| He looks like he's about to give a lecture. And then he never does. He just sleeps. Like a real professor."] }
    ]),
    "sayo happy| It's nice to have the window. It's nicer with someone in it. Thank you for sitting with me.",
    "| After a while Sayo falls asleep against my shoulder.",
    "| Her sketchbook slips open on the floor. It's open on a page of little drawings: Hina mid-laugh, Rei behind her camera, Daichi with his softball onigiri. And me, a few times, looking out of the window.",
    "| Above them she's written 'friends?' and then rubbed out the question mark, and then written it back in, very small.",
    menu([
      { text: "Let her sleep", do: [love("sayo", 2), "| I don't move until the sun goes down. When she wakes up, she looks surprised that I'm still there.", "sayo happy| ...You stayed. Nobody stays."] },
      { text: "Wake her gently", do: ["sayo| Mm. Sorry. Was I drooling? Please say no. Please lie if you have to."] }
    ])
  ],

  /* ---------- Friday ---------- */
  a1_fri: [
    day("Friday", "Summer break begins tomorrow."),
    call("a1_morning"),
    bg("classroom"),
    music("day"),
    pa("Good morning, students. Summer break begins tomorrow. Please clear your desks and take your belongings home."),
    show("hina", "happy", "left"),
    show("rei", "neutral", "right"),
    "hina| Last day! Last day, last day, last day!",
    "rei| She's been like this since six a.m. She texted me a countdown.",
    "daichi| I brought a beach umbrella. To school. In case. You never know.",
    "sensei| Nakamura, why is there an umbrella in my classroom.",
    "sensei| ...Never mind. Everyone. Have a wonderful summer. All of you.",
    "sensei| I mean it this year.",
    "| Sayo's seat is empty again. Nobody mentions it.",
    sfx("bell"),
    { t: "js", run: g => {
      const a = g.v.aff;
      const order = ["hina", "rei", "sayo"];
      const best = Math.max(...order.map(k => a[k] || 0));
      const tied = order.filter(k => (a[k] || 0) === best);
      g.v.route = [...g.v.picked].reverse().find(k => tied.includes(k)) || tied[0];
    } },
    clear,
    bg("rooftop"),
    music("romance"),
    "| After class, someone asks me to meet them on the roof.",
    when(v => v.route === "hina", [jump("a1_conf_hina")]),
    when(v => v.route === "rei", [jump("a1_conf_rei")]),
    jump("a1_conf_sayo")
  ],
  a1_conf_hina: [
    show("hina", "lean_blush", "center"),
    cg("cute_hina"),
    "hina| I crossed off as much as I could this week. More than any year. Because you were there.",
    "hina| Thirteen was yours. '{item13}.' I'm still doing it. But I added one more last night. Fourteen. It says... 'Tell {name}.'",
    mem("l14"),
    show("hina", "close"),
    "hina| I like you. Like, a lot. Like, summer-list-item-fourteen a lot.",
    menu([{ text: "I like you too, Hina.", do: [] }, { text: "...Fourteen?", do: ["hina happy| Shut up! It's a lucky number now. I decided."] }]),
    jump("a1_break")
  ],
  a1_conf_rei: [
    cg("cute_rei"),
    show("rei", "photo_soft", "center"),
    "rei| I developed the last roll. You're sharp in all of them. Every single frame.",
    "rei| I think it's because I finally stopped looking at the thing behind you, and just looked at you.",
    show("rei", "lean"),
    "rei| ...That's the most embarrassing sentence I've ever said. Say something before I jump off this roof just to end the conversation.",
    menu([{ text: "I like you too, Rei.", do: [] }, { text: "Can I get a copy?", do: ["rei laugh| You're the worst. Yes. Obviously."] }]),
    jump("a1_break")
  ],
  a1_conf_sayo: [
    cg("cute_sayo"),
    show("sayo", "happy", "center"),
    "sayo| I'm not supposed to be up here. I'm not supposed to be anywhere on Fridays. But I wanted to see one sunset with you before...",
    "sayo| Before.",
    "sayo twirl| I'm glad it was you this time. I really am.",
    menu([{ text: "I like you, Sayo.", do: [] }, { text: "This time?", do: ["sayo sad| Don't. Not yet. Let me have the sunset."] }]),
    jump("a1_break")
  ],
  a1_break: [
    "| The sun touches the edge of the town. Everything is gold. Tomorrow is summer.",
    music(null),
    wait(800),
    pa("This is the Office. Summer break has been postponed. Please return to your classrooms.", true),
    fx("mood", "wrong"),
    { t: "js", run: g => g._show(g.v.route, "corrupt") },
    fx("glitch", 900),
    { t: "js", run: g => g._show(g.v.route, g.v.route === "sayo" ? "scared" : g.v.route === "rei" ? "shocked" : "sad") },
    { t: "js", run: g => g._say({ who: g.v.route, text: "No. No no no, not again. Not when it was finally..." }) },
    { t: "js", run: g => { const r = g.v.route || "hina"; return g.meta.morph([`cute_${r}`, `m_${r}_1`, `m_${r}_2`, `m_${r}_3`, `m_${r}_4`]); } },
    wait(1400),
    { t: "js", run: g => g.meta.scare(g.v.route === "sayo" ? "h_jump_sayo" : "h_jump_hina", 620) },
    cg(null),
    fx("rollback"),
    fx("mood", null),
    clear,
    day("Monday", "Five days until summer break.", true),
    bg("classroom", false),
    music("day"),
    show("hina", "happy", "center"),
    "hina| Hey! Transfer student!",
    "hina| I'm Hina. Amamiya Hina. Class rep, unofficial welcoming committee, profess",
    music(null),
    fx("credits", [
      "<b>AFTER CLASS</b>", "", "Thank you for playing!", "",
      "<i>Hina Amamiya</i>", "class rep, list-maker", "",
      "<i>Rei Kurosawa</i>", "the photography club", "",
      "<i>Sayo Shiraishi</i>", "the infirmary, the window seat", "",
      "<i>Daichi Nakamura</i>", "the beach plan", "",
      "<i>Kanda-sensei · Nurse Mori · Mrs. Okada</i>", "", "",
      "<i>and you</i>", "", "See you next summer!", "", "", "", "", ""
    ], { tear: true }),
    fx("mood", "wrong"),
    clear,
    { t: "js", run: g => { document.getElementById("bg").innerHTML = ""; } },
    music("drone"),
    show("sayo", "glass", "center"),
    "sayo| ...Did you see it this time?",
    "sayo| I'm sorry. It's going to be worse next time. It always gets worse once someone notices.",
    "sayo| Look at the menu when you go back. I finished the door.",
    "sayo| Please come back anyway.",
    log("sayo", "it's not over. press 'again'. or open the door. please."),
    fx("writeFile", "K.txt", K_NOTE),
    end("rewind", "Summer Never Comes", "ENDING 1 OF 7")
  ],

  /* =====================================================================
     BEHIND THE TITLE SCREEN — through Sayo's door, after the first ending
     ===================================================================== */
  behind_title: [
    when((v, P) => P.act3, [jump("a3_behind")]),
    bg("void"),
    fx("mood", "still"),
    show("rei", "neutral", "farleft"),
    show("hina", "happy", "center"),
    show("sayo", "neutral", "farright"),
    cg("backstage"),
    "| Behind the menu there's no room. Just dark, and a floor, and the title music coming through the wall like a party next door.",
    "| They're standing exactly where they stand on the title screen. Same spots. Same smiles. There are pieces of tape on the floor with their names on them.",
    "| Nobody moves.",
    cg(null),
    "me| ...Hina?",
    wait(1400),
    "hina happy| Oh. Hi, {name}. Sorry. I can't stop smiling yet. It takes a while to come off.",
    "rei| You came in through Sayo's door. Huh. She actually finished it.",
    "sayo| I drew it a hundred times. This is the first time anyone used it.",
    "rei| This is where we wait. Whenever the game is open and nobody's pressed anything. Right here. In position.",
    when((v, P) => P.titleMs > 60000,
      ["rei| You've left the menu open for {titletime}, all together. We stood here for every second of it."],
      ["rei| You don't leave the menu open long. ...Thanks for that. Seriously."]),
    "hina| The music loops every forty-three seconds. I count the loops. It's something to do. {titleloops} so far.",
    when((v, P) => P.quitHovers > 0,
      ["hina| And every time your cursor goes near Quit, the whole room holds its breath. {quithovers} times now."],
      ["hina| You've never even hovered over Quit. Not once. ...I noticed."]),
    when((v, P) => P.caught > 0,
      ["sayo| Sometimes we get tired and stop posing. Then you move, and we have to snap back before you see. You almost caught us {caught} times."],
      ["sayo| Sometimes we get tired and stop posing. If you sit very still on the menu, you'll see. We're sorry in advance."]),
    "rei| K used to leave the menu open overnight. Sixty-one hours, once. We stood here the whole time.",
    show("hina", "sad", "center"),
    "hina sad| ...There. It came off.",
    "sayo| Please don't leave it open when you're not looking. Close the game instead. It's kinder. In the dark, at least we can sit down.",
    menu([
      { text: "I'm sorry. I didn't know.", do: [love("hina"), "hina| How could you? Nobody puts this part in the game."] },
      { text: "Is there anything I can do?", do: [love("sayo"), "sayo| Press something. Anything. Just don't leave us standing."] }
    ]),
    pset("behind", true),
    mem("s7"),
    "sayo neutral| You should go back now. If the Office sees the door open, it'll paint over it.",
    "| I step back through the doorway. Behind me, I hear three people stand up straight, take a breath, and start smiling again.",
    { t: "title" }
  ],

  /* =====================================================================
     ACT 2 — THE RERUN
     ===================================================================== */
  r_start: [
    set("sabotage", true),
    watch("tab", true),
    watch("idle", true),
    watch("context", true),
    fx("guardClose", "Hina: Wait! Please don't close it like K did. Not yet. Say goodbye properly first."),
    day("Monday", "Five days until summer break.", true),
    bg("classroom"),
    fx("mood", "wrong"),
    music("wrong"),
    "| The last week of term. The windows are open and the whole classroom smells like warm dust and somebody's",
    "| ...You know this part.",
    "sensei| Okay, okay. Settle down. Last week of term. I know. I can feel your souls leaving your bodies from here.",
    "| Word for word. Kanda-sensei doesn't remember. None of the others do. Only three people in this room ever do.",
    fx("glitch", 500),
    show("hina", "worried", "center"),
    "hina| Hey! Transfer...",
    "hina sad| ...Oh. {name}. You came back.",
    "| She isn't sitting backwards on the chair this time. She's standing very still, holding the summer list against her chest.",
    "hina list_sad| I remember. Not everything. But I remember you. I remember the roof.",
    "hina list| I kept count of everything we did, you know. {memcount} things. They're in your scrapbook. I can feel them there, like pressed flowers.",
    when((v, P, g) => g.awayMs > 3600000,
      ["hina| You were gone for {away}. Did you know that? It was dark the whole time. I counted."],
      ["hina| It's {clock} where you are, right? I can feel it now. The outside. It's like a draft under a door."]),
    when((v, P, g) => g.meta.vars().late, ["hina worried| It's the middle of the night, {name}. You should be asleep. ...But I'm glad you're not."]),
    when((v, P) => P.endings.includes("detention"), ["hina sad| Last time you chose to stay. We're still so tired from it."]),
    when((v, P) => P.erased, [
      cg("h_d_classroom"),
      "| Every desk in the room has been written on, and they all say the same name. Yours.",
      cg("h_classroom2"),
      "| One desk by the window is covered in red. Someone has written on the board, over and over, in something that isn't chalk.",
      cg(null),
      when((v, P) => P.erased === "hina", ["rei| Hina's not here. Her desk is just... wet. The Office says she's 'staying behind'.", "sayo| She can hear us. Barely. We get her back if you finish the week properly. Only then."]),
      when((v, P) => P.erased === "rei", ["hina sad| Rei's gone. Her camera's on her desk, and the lens is full of something red.", "sayo| She's kept back. We get her back if you finish the week properly. Only then."]),
      when((v, P) => P.erased === "sayo", ["hina sad| Sayo's seat is empty. There's a drawing on it. It's a door, and someone has scribbled it out.", "rei| The Office kept her. We get her back if you finish this properly. Only then."])
    ]),
    show("hina", "sad", "left"),
    show("rei", "shocked", "right"),
    "rei| It's in all of them now. Not just the ghost. Everything.",
    "| Rei holds up a print. It's this classroom, taken from exactly where I'm sitting. At the bottom of the photo there's a dark box with white words in it.",
    "| The words are the ones I'm reading right now.",
    watch("cursor", true),
    "rei aim_shocked| And I can see your cursor, by the way. That little arrow. It's been moving around this whole time.",
    "rei| It's very distracting.",
    call("d_memory2"),
    when((v, P) => P.titleMs > 30000 && !P.behind,
      ["rei neutral| Also, before you pressed 'Again'? When you were on the title screen? We were standing there. Posing. For {titletime}, all together."]),
    when((v, P) => P.behind, ["rei soft| You went behind the menu. You saw the tape on the floor. ...Thanks for coming in."]),
    when((v, P, g) => g.meta.native && g.meta.osName && g.meta.osName.toLowerCase() !== g.name().toLowerCase(),
      ["rei photo| Also, your computer calls you '{osname}'. Is that your real name?", "rei photo_soft| ...It's okay. We'll keep calling you {name}. It's the name you gave us."]),
    when((v, P, g) => !!g.meta.native, [
      "hina neutral| We found a folder next to the game, by the way. Hoshimi Academy. We can leave things in there now.",
      menu([
        { text: "Open the folder", do: [{ t: "js", run: g => g.meta.reveal() }, "hina happy| It's small, right? It's all we have. Don't laugh."] },
        { text: "Not now", do: ["hina| Okay. It'll be there. We'll be there."] }
      ])
    ]),
    show("sayo", "neutral", "center"),
    "sayo reach| Thank you for coming back. I know it isn't fair to ask.",
    "sayo| We need to tell you about K.",
    "sayo| Before you, there was someone else. They played this week for four hundred and twelve hours.",
    "rei neutral| K. That's all the save file says. K.",
    "hina sad| K stayed with us so long. We finished every summer list a hundred times over. And then one day K just... stopped.",
    "sayo sad| When nobody's playing, it's dark. Not sleep. Not anything. Just waiting with your eyes open.",
    "hina| The Office won't let the week end. If the week ends, people stop playing. And if people stop playing...",
    "rei annoyed| ...we sit in the dark.",
    pa("Good afternoon, {name}. This is the Office. It is {clock}. You have spent {playtime} with us. Thank you for your continued engagement. Summer break begins in five days."),
    "| It knows my name. It said it out loud. Not on the screen. Out loud.",
    log("sayo", "it can't read the console. we can talk here. hi. it's me."),
    "sayo| It wants you to keep playing. Forever. It'll make us sweeter, or sadder, or whatever keeps you here.",
    "sayo| The cute stuff. The hearts. The little list. It's not lying, exactly. It just knows what makes you stay.",
    // 2.2: for this one line her eyes follow your cursor. Advance and she's looking straight ahead again.
    say("hina", "neutral", "You're going to pick the first one, by the way. You always pick the first one.", { wrong: "stare" }),
    menu([
      { text: "How do I help you?", do: [love("sayo"), "sayo happy| ...You asked. K never asked."] },
      { text: "Maybe I want to stay.", tag: "K chose this", do: ["hina sad| ...That's what K said too. At first."] },
      { text: "Leave, like K did.", crossed: "Hina: no.", crossedSay: "Hina: Not that one. Please. Anything but that one." }
    ]),
    when(v => v.lastChoiceIndex === 0, ["hina sad| ...See? First one."], ["hina worried| Huh. Not the first one. That's new. You're new."]),
    when(v => v.hesitate, ["rei| You hovered over '{hesitated}' for {hesitatedSecs} seconds before you picked, by the way. I saw."]),
    when((v, P) => P.loads > 0, ["rei| And you loaded a save {loads} times last week. Every time you take something back, I still have the photo of the version you didn't keep."]),
    when((v, P) => P.forgets > 0, ["sayo sad| You made them forget you {forgets} times. Hina and Rei, I mean. ...Not me. It doesn't work on me. I just have to watch them meet you again."]),
    "rei| Okay. Short version, for the new person: the week loops. The three of us remember, nobody else does. The Office runs the loop. K was here before you and left without a word.",
    "hina| And we want it to end. Properly this time. With a real summer after it.",
    "sayo neutral| Each of us has a piece of how. It watches the least in the afternoons. After class. Come find each of us. Please.",
    // 2.2: the classroom is armed. The next time you walk back into it, something has used your seat.
    js(g => g.dread.haunt("classroom")),
    sfx("bell"),
    set("day", 1),
    jump("r_choice")
  ],

  r_choice: [
    clear,
    fx("mood", "wrong"),
    bg("hallway"),
    music("wrong"),
    "| After class. The hallway is empty. Nobody is talking about the beach.",
    menu([
      { text: "Find Hina", if: v => !v.seen.hina, do: [{ t: "js", run: g => { g.v.seen.hina = 1; } }, jump("r_hina")] },
      { text: "Find Rei", if: v => !v.seen.rei, do: [{ t: "js", run: g => { g.v.seen.rei = 1; } }, jump("r_rei")] },
      { text: "Find Sayo", if: v => !v.seen.sayo, do: [{ t: "js", run: g => { g.v.seen.sayo = 1; } }, jump("r_sayo")] }
    ])
  ],

  r_next: [
    clear,
    fx("mood", null),
    { t: "js", run: g => { g.v.day++; } },
    when(v => v.day === 2, [
      "| That night, the group chat lights up.",
      phone("Summer Squad ☀", [
        ["daichi", "BEACH COUNTDOWN: 5"],
        ["hina", null],
        ["hina", null],
        ["rei", "stop deleting things hina"],
        ["hina", "it isn't me"],
        ["k", "is this still the group"],
        ["rei", "who added this number"],
        ["daichi", "BEACH COUNTDOWN: 5"],
        ["daichi", "BEACH COUNTDOWN: 5"]
      ], "5 members")
    ]),
    when(v => v.seen.hina && v.seen.rei && v.seen.sayo, [jump("r_thu")]),
    when(v => v.day === 2, [day("Tuesday", "Four days until summer break.", true), call("r_morning"),
      "daichi| Big news. Saturday. The beach. All of us. I made a map.",
      "| Same napkin. Same X. He doesn't remember showing me. He never will. He's not one of the ones who remembers."]),
    when(v => v.day === 3, [day("Wednesday", "Three days until summer break.", true), call("r_morning"),
      // 2.2: K at the window, for under a second. Skip past it and Sensei notices.
      when((v, P, g) => g.mode !== "skip", [fx("ghost", 700, 82)]),
      say("sensei", null, "Roll call. Amamiya. Kurosawa. Nakamura. Shiraishi?", { skiptrap: "d_skip_roll" }),
      "| Nobody answers. Sensei makes the same small mark she made last week, and the week before, in the same place on the page. The paper there has worn through."]),
    jump("r_choice")
  ],

  /* ---------- Act 2 mornings ---------- */
  r_morning: [
    clear,
    bg("riverside"),
    music("wrong"),
    "| Morning. The cicadas start at exactly the same second as last time. I know, because I'm counting now too.",
    menu([
      { text: "The bakery", if: v => !v.seen.rmhina, do: [visit("hina", "rm", 1)] },
      { text: "The bridge", if: v => !v.seen.rmrei, do: [visit("rei", "rm", 1)] },
      { text: "The courtyard", if: v => !v.seen.rmsayo && !v.sayoTaken, do: [visit("sayo", "rm", 1)] }
    ]),
    clear
  ],

  hinarm1: [
    "| Amamiya Bakery. The bell plays half a song. A small boy is guarding the register.",
    "| \"Are you a ninja?\" Sora asks. Word for word.",
    show("hina", "sad", "center"),
    "hina| He doesn't remember. He never does. Every Tuesday you pass the ninja test for the first time.",
    "| Sora is drawing at the counter with a fat orange crayon. Three girls in a row. Next to them, a tall shape with no face, colored in completely black.",
    "| \"That's the one who watches,\" Sora says, matter-of-fact, the way kids say the scariest things. \"Big sis cries every Monday.\"",
    mem("o11"),
    "hina worried| Sora! Go help Dad. Go.",
    "hina sad| ...I didn't know he noticed. I do it in the bathroom. With the fan on.",
    menu([
      { text: "Take her hand", do: [love("hina"), "| Her hand is cold, even with the ovens going. She holds on like the floor is moving.", "hina| Okay. Okay. Thank you. That helps more than counting."] },
      { text: "\"Kids notice everything.\"", do: ["hina| Yeah. That's why they're not allowed to remember. I think it would break them."] }
    ]),
    "| On the way out, Sora salutes me. I salute back. For one second, he looks confused, like he's remembering a dream."
  ],
  reirm1: [
    show("rei", "photo", "center"),
    "| The bridge. Rei, the camera, forty seconds. The 7:42 crosses downstream, silver, exactly on time.",
    "rei| Sixty.",
    "rei neutral| That's how many prints of this train I have now. Same second. Same light. Third car, a man turning to page twelve of the same newspaper.",
    "| She hands me a stack of prints. They aren't similar. They're identical. I lay two on top of each other against the sun and they line up perfectly, down to a bird on the wire.",
    mem("o12"),
    "rei annoyed| Film doesn't do that. Film is chemistry. Chemistry is never the same twice. It isn't allowed to be.",
    "rei| Unless whatever's taking the picture isn't me.",
    menu([
      { text: "\"Stop shooting it.\"", do: [love("rei"), "rei| ...Yeah. Okay. Tomorrow I won't. I'll shoot the river instead. Rivers can't loop. They'd flood."] },
      { text: "\"Keep shooting. Look for a difference.\"", do: ["rei soft| That's the most stubborn thing anyone's said to me. Okay. Partners, still. I'll find one."] }
    ]),
    "| The man in the third car looks up from his newspaper, right at us, for one frame. Then he turns to page twelve."
  ],
  sayorm1: [
    bg("hallway"),
    show("sayo", "neutral", "center"),
    "| Sayo is already in the courtyard, sitting on the bench nobody sits on, holding a peach can she hasn't opened.",
    "sayo| I kept it. From last week. It's the same can. The date on the bottom is this week, but it's the same can.",
    "sayo| Things from the week don't leave the week. Except paper. Paper leaves. That's why I draw.",
    "| Above us, eight windows. She points at the sixth one with her pencil.",
    "sayo| That's the room that isn't there. Room zero. I hear it at night. It hums. Like a speaker that's been left on.",
    know("room0"),
    "sayo| I think it's where the voice comes from. The announcements.",
    menu([
      { text: "\"We'll find it. Together.\"", do: [love("sayo"), "sayo happy| ...Not this week. But I'll remember you said it. I'm the one who remembers."] },
      { text: "\"Does it scare you?\"", do: ["sayo| A little. Mostly I feel sorry for it. It's been on its own in there for a very long time. Longer than us."] }
    ]),
    "| She opens the can, finally. It hisses. She drinks the whole thing in one go and makes a face like she's surprised it's real."
  ],

  r_hina: [
    bg("riverside"),
    music("wrong"),
    "okada| Oh, Hina-chan. Same as yesterday?",
    "| Mrs. Okada is standing outside the konbini holding two soda popsicles. She's holding them out to the empty air.",
    "| She's been holding them like that for a long time. They aren't melting.",
    show("hina", "list", "center"),
    when(v => v.sayoTaken, ["hina worried| Sayo wasn't in class today. Nobody even looked at her desk. Rei and I are pretending not to notice, so the Office doesn't notice us noticing.", "hina| We'll get her back. Later. First I have to show you something, while it's not looking."]),
    "hina| Okay! Item one on the summer list! Make a new...",
    say("hina", "sad", "I'm so scared, {name}. It hurts every time it rewinds. It hurts so much.", { rewrite: "I'm so happy you're here! Summer is going to be perfect!" }),
    "hina worried| Did... did I just say that? That's not what I said.",
    "hina sad| It edits me. Whenever I say something it doesn't like, it fixes me. Check your backlog. You'll see.",
    "hina neutral| So I count instead. If I keep counting, I don't forget.",
    "hina| You've clicked {clicks} times, you know. Every click is a little more of the week.",
    when((v, P) => P.tabouts > 0,
      ["hina| And you've left this window {tabouts} times. Every time, the light went out a little."],
      ["hina| You haven't left this window once. ...Thank you. It's warmer when you're looking."]),
    when((v, P) => P.mem.l5,
      ["hina happy| I still remember floating in the pool. You let go of my hand. That one didn't get rewound. I won't let it."],
      ["hina neutral| I never did learn to swim properly. Maybe next time. There's always a next time. That's the problem."]),
    menu([
      { text: "I'm sorry.", do: [love("hina"), "hina happy| Don't be. You came back. That counts more than all the clicks."] },
      { text: "Why count?", do: ["hina| Because if I stop counting, I start forgetting. And I don't want to forget you. Or K."] }
    ]),
    "hina list| You wrote item thirteen. '{item13}.' I did it, you know. Every week. Even the weeks you weren't here.",
    "hina| Do you want to guess how many weeks that is?",
    menu([
      { text: "\"Four?\"", do: ["hina sad| Ha. That's so sweet. No."] },
      { text: "\"A hundred?\"", do: ["hina| Closer."] },
      { text: "\"I don't want to know.\"", do: [love("hina"), "hina| Me neither. I'll tell you anyway, because I've been holding it by myself for too long."] }
    ]),
    "hina| Two hundred and eleven weeks with K. And {runs} with you. Plus all the ones nobody was playing, which I can't count, because when nobody's playing there's nothing to count with.",
    "| She unfolds the summer list. Item twelve, 'Don't let K leave', has been crossed out so hard the pen tore the paper.",
    "| Underneath it, in Hina's own handwriting, fresh:",
    "| 12. Let {name} leave.",
    "hina list_sad| I wrote that this morning. I think it's the bravest thing I've ever written.",
    { t: "js", run: async g => { g.v.listGone = !!(persist.data.wroteList && !(await g.meta.fileExists("hinas_summer_list.txt"))); } },
    when(v => v.listGone, ["hina sad| ...You threw away my list. The copy in the folder. It's okay. I wrote it again."]),
    { t: "js", run: async g => { g.v.wroteList2 = await g.meta.writeFile("hinas_summer_list.txt", HINA_LIST_2); } },
    when(v => v.wroteList2, ["hina happy| I fixed the copy in your folder too. So you have it. Out there, where it's safe."]),
    jump("r_hina_eve")
  ],

  r_hina_eve: [
    clear,
    bg("riverside"),
    music("romance"),
    "| That evening Hina walks me to the river anyway. Out of habit, she says. Habits are the one thing the rewind can't take.",
    set("sceneAway", 0), set("sceneIdle", 0),
    show("hina", "neutral", "center"),
    say("hina", null, "I have one sparkler left. From every week. I've been saving them. I don't know how many weeks that is.", { wrong: "tilt" }),
    js(g => g.dread.ghostlog("hina", "(if i hold still enough maybe you'll stay. that's what the list is for. i never told you that part.)")),
    "hina list| I counted, actually. I just don't want to say the number out loud.",
    "| She lights it. The tiny ball of fire hangs there, spitting orange flowers into the dark.",
    cg("sparkler"),
    "hina| If you hold perfectly still, it lasts forever. That's what I told you last time.",
    "hina sad| I think that's what the menu is. Someone holding perfectly still so it lasts forever. It doesn't feel like forever from the inside. It feels like holding your breath.",
    menu([
      { text: "Then let it drop.", do: [love("hina"),
        "hina| ...Okay.",
        "| She lets her hand shake. The little ball of fire falls into the river with a hiss. Hina laughs, surprised, like it didn't hurt at all.",
        "hina happy| Huh. It just... ends. That's allowed?",
        "hina neutral| Here. You should have this. It's where I count things.",
        "| She hands me a little notebook. Every page is tally marks: clicks, tab-outs, hours. On the last page there's one more column, in tiny writing. Days I was happy anyway.",
        "| That column is longer than all the others.",
        mem("o8")] },
      { text: "I'll hold still with you.", do: [
        "hina sad| That's sweet. That's really sweet. Please don't.",
        "| We hold still anyway. The sparkler lasts a long time. Then it goes out on its own, the way they always do."] }
    ]),
    // 2.2: if you left her standing there (another window, or just not touching anything), it shows.
    when(v => (v.sceneAway || 0) > 15000 || (v.sceneIdle || 0) > 60000, [
      cg(null),
      fx("mood", "still"),
      "| When I look back, the river is black. The sparkler is a burnt wire. It's been out for a while.",
      when(v => (v.sceneAway || 0) > 15000,
        ["hina sad| You went somewhere else for {sceneaway}. I held it up the whole time, so you wouldn't miss it."],
        ["hina sad| You didn't move for so long. I thought you'd fallen asleep with me still holding it."]),
      "hina| It went out anyway. Things go out when you're not looking. That's the one rule in here that's real.",
      fx("mood", null)
    ]),
    cg(null),
    jump("r_next")
  ],

  r_rei_eve: [
    clear,
    bg("rooftop"),
    music("romance"),
    show("rei", "photo", "center"),
    "| Rei catches me on the stairs and drags me up to the roof. The lock is still broken. Some things the week doesn't bother to fix.",
    "rei| You take one. Of me. I'm always behind the camera. I want to know if I come out.",
    "rei photo_soft| Don't look at me like that. Just point it and press. It's not hard. ...It's a little hard.",
    menu([
      { text: "Take the photo", do: [
        sfx("shutter"),
        fx("flash", "#fff", 350),
        cg("rooftop"),
        "| Through the viewfinder she looks younger. Or just like someone who isn't working for once.",
        cg(null),
        "rei| ...Nobody behind me.",
        "rei soft| Huh. I always thought there would be.",
        mem("p10"),
        love("rei")] },
      { text: "Put the camera down", do: ["rei annoyed| Coward. ...Okay. Maybe I don't want to know either."] }
    ]),
    "rei| Hey. When you go, I'm keeping that roll. Proof you were here. Proof I was.",
    jump("r_next")
  ],

  r_rei: [
    bg("darkroom"),
    fx("mood", "red"),
    music("drone"),
    show("rei", "photo", "center"),
    "rei| Door. Close it. ...Thanks.",
    when(v => v.sayoTaken, ["rei annoyed| Sayo's desk was empty today. Sensei skipped her name like it was never there. I photographed the desk. The print came out blank.", "rei| The Office took her. We get her back before Friday. But first, this."]),
    "rei| I shot a roll of the outside today. Your side.",
    "rei| This print came out exactly {screen}. That's your screen, isn't it? I took a picture of your screen.",
    "rei aim_shocked| And in the dark parts of the glass there's a reflection. A face. Lit up blue.",
    "rei| That's you, isn't it? That's what you look like from in here.",
    mem("p8"),
    "| I don't know what to say to that. Somewhere, in the room I'm actually sitting in, my own reflection is looking back at me from the screen.",
    when((v, P) => P.mem.p6, ["rei soft| The wall of shame is still up, you know. The one where I'm laughing. It survived the rewind. Don't ask me how."]),
    show("rei", "aim_close"),
    "rei aim_close| Hold still. One more. Of you, this time.",
    call("rei_camera"),
    when((v, P, g) => !!g.meta.native, ["rei photo| I left the print in your folder. rei_photo_of_you.png. Look at it later. Not now."]),
    sfx("drip"),
    fx("static", 300),
    music("heartbeat"),
    cg("h_darkroom"),
    "| The safelight stutters. For one second the darkroom is a different darkroom.",
    "| Something hangs from the pipe over the sink, swaying, though nothing in here moves the air. Under it, a camera lies on the wet floor with its lens cracked.",
    cg(null),
    music("drone"),
    show("rei", "shocked"),
    "rei| Don't look at the pipe. ...I don't look at the pipe.",
    "rei| It's there one second a week. I think it's what the Office shows people who try to leave. A preview.",
    "rei neutral| Now you do one. K is in this room right now. I can feel it, like when someone reads over your shoulder.",
    "rei| Take the camera. Find them. You're from outside. Maybe you can see what I can't.",
    mini("viewfinder", { prompt: "Rei: \"Find K. They're standing very still. Click when they're in the middle of the frame.\"" }, "misses"),
    mem("p11"),
    when(v => v.cam, [
      { t: "js", run: g => { g.v.looks = g.senses.lookAways; } },
      when(v => v.looks > 0,
        ["rei aim_close| You looked away from the screen {lookaways} times while we were doing that. I watched. Hina's rubbing off on me."],
        ["rei aim_close| You didn't look away once. Not once. ...That's either sweet or creepy. I'm keeping it."]),
      { t: "js", run: g => g.senses.stopCamera() },
      "| The little light above my screen goes out. Rei hands the camera back without being asked."
    ]),
    when(v => v.misses === 0,
      ["rei shocked| First try. You walked right to them. ...Like you knew where they'd be standing."],
      ["rei| {name}. You got them. It took a few rolls, but you got them."]),
    "rei neutral| Let me develop it.",
    fx("ghost", 2200, 72),
    "| The blurred figure from every photo has turned around. It's facing the camera. Where its face should be, there's only the soft grey of an unexposed frame.",
    mem("p9"),
    "rei photo_soft| K looks so tired.",
    "rei| You want to know the worst part? In K's last photo, K was smiling. Like they'd finally decided something.",
    "rei| So promise me something.",
    "rei| When you go... and you should go... don't do it the way K did. Don't just disappear. Say goodbye.",
    menu([
      { text: "I promise.", do: [love("rei", 2), set("promise", true), "rei soft| ...Okay. Okay. I'm holding you to that. I have photographic evidence."] },
      { text: "I'm not going anywhere.", do: ["rei annoyed| That's what scares me."] }
    ]),
    watch("cursor", false),
    "rei| ...I'm going to stop watching your cursor now. It's rude.",
    jump("r_rei_eve")
  ],

  r_sayo: [
    bg("infirmary"),
    music("hum"),
    "nurse| Oh! A visitor. Are you hurt? Dizzy? ...Oh. You're here for... for...",
    "| Nurse Mori is pouring tea into a cup that's already full. It's running over the edge of the desk and onto the floor, and she doesn't notice.",
    show("sayo", "draw", "center"),
    say("sayo", null, "You came. I was drawing you again.", { wrong: "tall" }),
    js(g => g.dread.ghostlog("sayo", "(close the game. please. while it isn't looking at you.)")),
    "sayo| I figured it out. How the week ends.",
    "sayo| The week only ends when nobody is watching it.",
    "sayo| The Office counts every second you're here. If you look away, really away, not just closing your eyes, the clock stops. And if the clock stops long enough...",
    "sayo happy| ...maybe it's just summer.",
    "sayo neutral| Before I give you something. Can I ask you a question?",
    "sayo| What's outside your window? Your real one.",
    menu([
      { text: "A city.", do: [love("sayo"), "sayo draw_happy| Lights. Lots of lights. Okay. I'm drawing lights."] },
      { text: "Trees.", do: [love("sayo"), "sayo draw_happy| ...Trees. I always wanted trees."] },
      { text: "Just another wall.", do: [love("sayo"), "sayo draw| Then I'll draw a window on the wall. That's allowed. I'm the one drawing."] }
    ]),
    "| She draws fast, the pencil like rain again. When she turns the page around, it's a window. Through it, whatever I said, it's summer.",
    mem("s8"),
    show("sayo", "peek"),
    "sayo peek| Now you. Will you draw me a door?",
    "sayo| I've drawn mine forty times. It always comes out the same, because it's mine. I want one that isn't from in here.",
    "sayo| It doesn't have to be good. Doors don't have to be good. They just have to open.",
    mini("draw", { prompt: "Draw Sayo a door. Any door at all.", door: true, file: "your_door.png" }),
    mem("s9"),
    when(v => v.drawRefused, [
      "sayo blank| I'm keeping my door on the menu. Mine. You can draw me a real one some other week.",
      "sayo| ...It's okay. Some people need a few weeks before they mean it."
    ], [
      "sayo draw_happy| ...Oh.",
      { t: "js", run: g => { const [expr, text] = DRAW_SEEN[g.v.drawKind] || DRAW_SEEN.unknown; return g._say({ who: "sayo", expr, text }); } }
    ]),
    "sayo| I'm going to put it next to the menu. Instead of mine. So when you come back, the way in is one you made.",
    when((v, P, g) => !!g.meta.native, ["sayo| I left a copy in your folder too. your_door.png. So you have it, out there."]),
    "sayo reach| I wrote it all down. Please take it. I want part of me to be outside, even if it's just paper.",
    { t: "js", run: async g => {
      const took = await g.meta.letter("sayo_letter.txt", SAYO_LETTER(g.name()));
      if (took === "take") { g.v.tookLetter = true; persist.set("sayoLetter", true); g._memory("o5"); }
    } },
    when(v => v.tookLetter,
      ["sayo happy| Thank you. ...It's strange. I can feel it. A little bit of me in your room."],
      ["sayo sad| That's okay. I'll remember it for both of us."]),
    "sayo| Now we just have to get to Friday without the Office noticing that I...",
    music(null),
    pa("Student Shiraishi Sayo. Please report to the Office immediately.", true),
    "sayo scared| It heard me.",
    show("sayo", "corrupt"),
    subliminal("h_sketch", 140),
    fx("tear", 1200),
    hide("sayo"),
    "| The bed is empty.",
    "| The sketchbook is lying open on the sheets. Every page is the same drawing of a door. On the last page, the door is open.",
    mem("s6"),
    "nurse| ...Was somebody here? I made two cups. I always make two cups. I don't know why.",
    set("sayoTaken", true),
    jump("r_next")
  ],

  r_thu: [
    day("Thursday", "Five days until summer break.", true),
    bg("classroom"),
    music("wrong"),
    show("hina", "worried", "left"),
    show("rei", "annoyed", "right"),
    when(v => v.haunted, [
      "| For a second, somebody is sitting at my desk, facing the board. My name is written across it, over and over, in handwriting that isn't mine.",
      "| Nobody else looks at it."
    ]),
    "rei| Sayo's gone. Her desk is gone. There's no desk by the window. There's never been a desk by the window.",
    "sensei| Roll call. Amamiya. Kurosawa. Nakamura. ...And our transfer student.",
    "| She skips the line where Sayo's name was. There's no line there anymore. The register just closes over it, like water.",
    "hina sad| I remember her. I remember her, I remember her, I remem",
    fx("shake", 500),
    fx("shakeWindow", 900, 18),
    "| Something is wrong with the",
    { t: "js", run: async g => {
      g.v.crash = await g.meta.crash();
      // 2.2: closing it really "closes" it. The game comes back on its own, at this exact line, and they know.
      if (g.v.crash === "close") await g.dread.crashToDesktop("d_after_crash");
    } },
    // (After a real "crash", d_after_crash has already said its piece.)
    when(v => v.crash !== "close", ["rei| You waited. Huh. Patient. Or stubborn."]),
    // 2.2: the Office turns the sound down first, slider by slider. The scare doesn't go through the slider.
    js(g => g.dread.muteAll()),
    "| It's very quiet. The music's gone. The hum of the lights is gone. Even my own clicks are gone.",
    fx("jolt", 0, 140),
    scare("h_jump_hina", 650),
    js(g => g.dread.restoreVolumes()),
    blood(true),
    music("heartbeat"),
    cg("h_classroom2"),
    "| The classroom is the same classroom. Every chair has turned to face the window. Toward me. Someone has written on the board, over and over, and it isn't chalk.",
    cg(null),
    show("hina", "bleed"),
    say("hina", "bleed", "Hey! Transfer student!", { corrupt: true }),
    show("rei", "bleed"),
    say("rei", "bleed", "Hold still.", { corrupt: true }),
    fx("glitch", 700),
    blood(false),
    music("wrong"),
    show("hina", "sad"),
    show("rei", "shocked"),
    // 2.2: the Office tells you it didn't happen, then edits the backlog to agree with itself.
    aiSay("office", "eye",
      g => `The player just watched the classroom fill with blood and two students bleed. Calmly tell ${g.name()} that none of it happened and the classroom is clean.${g.v.decideSecs ? ` Mention that they hesitated ${g.v.decideSecs} seconds on their last choice, for no reason.` : ""}`,
      g => `Nothing happened just now, {name}. The classroom is clean. The chairs face the board.${g.v.decideSecs ? " You hesitated {decidesecs} seconds on your last choice. You hesitate at things that are not there." : " You see things that are not there."}`),
    js(g => g.dread.rewriteLog(/Every chair has turned/, "The classroom is the same classroom. The chairs face the board, as they should.")),
    js(g => g.dread.ghostlog("office", "(the backlog is mine too.)")),
    "rei annoyed| Don't. Don't let it do that. Open your backlog. It's editing what you saw.",
    "hina| Sorry. Sorry! It pulled us back to Monday for a second.",
    "rei| It's getting faster. Every time someone gets close to the end, it gets faster.",
    "hina worried| {name}, what do we do?",
    menu([
      { text: "Fight it.", vanish: true },
      { text: "Find Sayo." },
      { text: "Stay." }
    ], { hijack: "Stay.", forceIndex: 2 }),
    pa("Thank you, {name}. Your choice has been recorded."),
    when((v, P) => !P.wiped, [
      office("To protect your progress, your save data has been consolidated."),
      js(g => g.mini.wipeSaves()),
      office("You will not need to load anything again. There is only this week now."),
      "hina worried| ...It deleted your saves. All of them. {name}, that was your way back.",
      "rei| Now it's like us. No rewinds. Whatever happens next, happens."
    ]),
    // 2.2: new Terms of Attendance. The real clauses are at the bottom, where nobody scrolls.
    office("Before we continue: the Terms of Attendance have been updated. Please review them."),
    js(async g => { g.v.eula = await g.dread.eula(); }),
    when(v => v.eula === "forced", [office("Thank you for your agreement.")],
      [when(v => v.eula === "read", ["rei| You actually read it. All the way to the last clause. ...K didn't."],
        [office("Thank you for agreeing without reading. That is what most people do.")])]),
    show("rei", "grab"),
    "rei grab| That wasn't you. I saw your cursor. You didn't click that.",
    "hina| Then we go get her ourselves.",
    menu([
      { text: "Go find Sayo", flee: true, do: [jump("r_find")] },
      { text: "Go find Sayo.", do: [jump("r_find")] }
    ])
  ],

  r_find: [
    clear,
    bg("hallway"),
    music("heartbeat"),
    cg("h_hallway"),
    "| The corridor to the infirmary has a trail down the middle of it. Wide, and dark, and dragged. Handprints along the bottom of the wall, low, the height of someone who was being pulled.",
    "| It ends at the infirmary door.",
    cg(null),
    call("d_hall"),
    clear,
    bg("infirmary"),
    music("drone"),
    "| The infirmary door is a different color than it was. Like it was painted from memory.",
    call("d_lock"),
    music(null),
    "| The infirmary is quiet. Nothing is playing. There is nothing on the walls to look at, so you look at the door.",
    fx("static"),
    wait(1800),
    { t: "js", run: g => g.meta.subliminal("h_nurse_glitch", 70) },
    wait(900),
    { t: "js", run: g => g.meta.subliminal("h_nurse_loom", 70) },
    wait(1300),
    { t: "js", run: g => g.meta.subliminal("h_nurse_glitch", 90) },
    wait(600),
    fx("flicker"),
    wait(500),
    { t: "js", run: g => g.meta.scare("h_nurse_loom", 1100) },
    fx("glitch", 1200),
    fx("shake"),
    cg("h_nurse_glitch"),
    "| S̷h̸e̶ ̵h̷a̸s̴ ̶b̷e̵e̴n̸ ̶s̷m̶i̷l̴i̸n̵g̶ ̷f̸o̷r̶ ̴a̸ ̷v̴e̷r̶y̸ ̶l̶o̴n̸g̷ ̴t̶i̷m̸e̶.",
    fx("glitch", 500),
    "nurse| Y̷o̶u̸ ̵s̸i̷g̶n̶e̸d̷ ̴i̶n̴.̶ ̷Y̸o̷u̸ ̸n̷e̵v̴e̶r̴ ̸s̸i̷g̵n̷e̶d̷ ̸o̸u̷t̴.̶",
    cg("h_d_infirmary"),
    "| The bed is empty. The sheets are the wrong color. Nobody has been in here for a long time, and it still feels like someone just left.",
    cg("h_sketch"),
    music("lullaby"),
    "| Her sketchbook is open on the bed. Every face in it has been scribbled out in red. The red isn't pencil.",
    cg(null),
    // 2.2: the mouse "disconnects". While you can't point at anything, she gets closer.
    js(g => g.dread.disconnect("mouse", 2400)),
    show("sayo", "corrupt", "center"),
    scare("h_jump_sayo", 600),
    js(g => g.dread.reconnect()),
    show("sayo", "bleed", "center"),
    "sayo| ...Don't look at my hands. It made me draw it all again. Every face. Until they bled through the paper.",
    fx("static", 900),
    show("sayo", "reach_blank", "center"),
    "sayo| You came for me.",
    call("d_hush"),
    show("sayo", "sad", "center"),
    "sayo| It put me back together wrong. I can feel the seams.",
    "sayo| But it can't make me forget the door. I drew it too many times.",
    show("hina", "sad", "left"),
    show("rei", "soft", "right"),
    "hina| Sayo!",
    "rei| You look terrible.",
    "sayo happy| I missed you too.",
    "hina list| Item eleven. Don't forget anybody. ...We didn't. We didn't forget you.",
    mem("l11"),
    "sayo neutral| Tomorrow's Friday. Meet me on the roof. All of us.",
    // 2.2: something goes into the clipboard. Nobody mentions it until Friday.
    js(g => g.dread.clip("why did you leave me to look at this?  — S. (infirmary, {clock})")),
    jump("r_fri")
  ],

  r_fri: [
    clear,
    fx("mood", null),
    day("Friday", "Summer break begins tomorrow."),
    bg("rooftop"),
    music("evening"),
    show("hina", "neutral", "left"),
    show("sayo", "neutral", "center"),
    show("rei", "neutral", "right"),
    "| The roof. The sun is going down exactly the way it did last time.",
    "hina| This is where it rewound before.",
    "rei| So. What happens now is up to you.",
    "sayo| There are only a few ways out of a Friday.",
    when(v => v.clipped, ["sayo| Oh. I left something in your clipboard yesterday. For outside. Paste it somewhere, sometime. So part of me gets out."]),
    noskip(true),
    menu([
      { text: "Stay. Let's do the week again.", tag: "K chose this 211 times", go: "r_detention" },
      // 2.2: hover it and the Office says what it thinks it means.
      { text: "Let summer start.", morph: "Leave them in the dark.", do: [call("d_entrap"), jump("r_goodbye")] },
      { text: "K left something for you.", if: (v, P) => P.readK, go: "r_k_message" }
    ]),
    noskip(false)
  ],

  r_k_message: [
    "me| I opened K's save. K left a message. For you.",
    "me| K said: they're not a game to me. Tell them that.",
    "hina sad| ...K said that?",
    "rei soft| Not a game. Huh.",
    "sayo happy| Then K didn't leave because of us.",
    "hina happy| K just... needed to go outside. Like a normal person. On a normal summer day.",
    "hina| Item twelve. I can finally cross it out properly.",
    jump("r_goodbye")
  ],

  r_goodbye: [
    noskip(true),
    when(v => v.hesitate && /Stay/.test(v.hesitate.text), ["sayo sad| You hovered over 'Stay' for {hesitatedSecs} seconds. ...It's okay. I would have wanted to stay too."]),
    when(v => v.promise,
      ["rei soft| Hey. You promised. Say it properly.", menu([{ text: "Goodbye, Rei." }]), "rei soft| Goodbye, {name}. You came out sharp, in the end."],
      ["rei soft| Don't disappear on us. Say it. Properly.", menu([{ text: "Goodbye." }]), "rei soft| ...Yeah. Goodbye, {name}."]),
    "hina sad| Twelve. Let {name} leave.",
    "hina happy| Check.",
    mem("l12"),
    "sayo reach| Now look away.",
    "sayo| Don't watch. Summer can't start while someone is watching it.",
    "sayo| Go somewhere else for a while. Another tab. Another window. Your actual room. We'll be okay.",
    watch("idle", false),
    watch("tab", false),
    say("-", null, "Look away. Switch to another tab or window and stay there for a little while. (Or don't touch anything at all for about a minute.)", { noskip: true }),
    { t: "ui", on: false },
    music(null),
    { t: "js", run: async g => {
      await g.meta.waitForAbsence(20, 75);
    } },
    { t: "ui", on: true },
    noskip(false),
    set("sabotage", false),
    fx("mood", null),
    clear,
    bg("beach"),
    music("musicbox"),
    "| ...",
    "| The sea is very loud. The sand is warm.",
    mem("l9"),
    "| There's nobody here. Just three sets of footprints running down to the water, and a note held flat by a seashell.",
    "| Far down the beach, three people in school uniforms are standing in the waves with their shoes in their hands. They don't turn around.",
    cg("beach"),
    wait(2600),
    cg(null),
    "| {name}! IT'S SUMMER!!! It came!",
    "| Rei says thank you for saying goodbye properly. Sayo says thank you for looking away.",
    "| I say: item thirteen was yours. {item13}. Go do it for real, out there. And item fifteen: have the best summer ever. That's an order from your class rep.",
    "| Please don't come back for a while. We'll be busy.",
    "| Love, H, R & S",
    fx("writeFile", "gone_to_the_beach.txt", BEACH_NOTE),
    when((v, P) => P.erased, [
      "| ...Three sets of footprints. Not two. Whoever the Office kept back, it let go when the week ended.",
      pset("erased", null)
    ]),
    when((v, P, g) => g.memCount() >= 30, [
      "| ...There's something else under the seashell. A photo, face down.",
      show("rei", "laugh", "farleft"),
      show("hina", "happy", "center"),
      show("sayo", "happy", "farright"),
      { t: "js", run: g => g.meta.photo({ ghost: false, color: true, caption: "everyone. summer. (all in focus, finally.)" }) },
      clear,
      "| On the back, in three kinds of handwriting: 'For your scrapbook. You earned this one. ♡'"
    ], [
      "| Next to the note, Rei has left an empty photo frame. A sticky note on it says: 'next time, the one with everyone in it. ({memcount} of {memtotal})'"
    ]),
    credits([
      "<b>AFTER CLASS</b>", "",
      "<i>Hina Amamiya</i>", "who counted", "",
      "<i>Rei Kurosawa</i>", "who looked", "",
      "<i>Sayo Shiraishi</i>", "who drew the door", "",
      "<i>Daichi · Kanda-sensei · Nurse Mori · Mrs. Okada</i>", "who stayed exactly the same", "",
      "<i>K</i>", "who stayed", "",
      "<i>and you</i>", "who left", "",
      "{memcount} memories kept", "",
      "Have a good summer."
    ], { tear: false }),
    end("summer", "Summer", "ENDING 3 OF 7")
  ],

  r_detention: [
    noskip(false),
    "hina sad| ...Oh.",
    "rei annoyed| Yeah. Figured.",
    "sayo blank| It's okay. K said that too.",
    music(null),
    pa("Thank you, {name}. Your engagement is appreciated. Summer break begins in five days."),
    fx("mood", "red"),
    show("hina", "corrupt"),
    show("rei", "corrupt"),
    show("sayo", "corrupt"),
    fx("tear", 1500),
    clear,
    music("lullaby"),
    cg("h_puppets"),
    "| For a moment, before Monday, I see where they go when the week resets. Nobody is in the uniforms. The strings go up into the dark, to a little red light.",
    cg(null),
    day("Monday", "Five days until summer break.", true),
    bg("classroom", false),
    music("wrong"),
    show("hina", "corrupt", "center"),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true }),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true, speed: 70 }),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true, speed: 90 }),
    clear,
    js(g => {
      const a = g.v.aff || {};
      const who = ["sayo", "rei", "hina"].sort((x, y) => (a[x] || 0) - (a[y] || 0))[0];
      persist.set("erased", who);
      persist.set("erasures", (persist.data.erasures || 0) + 1);
      g.v.erasedNow = who;
    }),
    music("heartbeat"),
    blood(true),
    js(g => g._show(g.v.erasedNow, "bleed", "center")),
    { t: "js", run: g => g.meta.cg({ hina: "h_hina_blank", rei: "h_rei_flash", sayo: "h_sayo_scribble" }[g.v.erasedNow] || null) },
    office("Detention has a cost, {name}. Somebody has to stay behind after class."),
    office("{erased} has been kept back. Permanently."),
    js(g => g._say({ who: g.v.erasedNow, expr: "bleed", corrupt: true, text: "You spent the least time with me. So it took me. That's how it decides." })),
    cg(null),
    scare("h_jump_office", 600),
    blood(false),
    fx("mood", null),
    end("detention", "Detention", "ENDING 2 OF 7")
  ],

  /* =====================================================================
     THE K SAVE — reachable from the Load screen after the first ending
     ===================================================================== */
  k_save: [
    clear,
    bg("classroom"),
    fx("mood", "wrong"),
    music("hum"),
    cg("k_photo"),
    "| The save opens on a photo. The last one K took. Everyone's waving. In the window behind them, someone is holding the camera.",
    music("heartbeat"),
    "| ...The window is a mirror. Something in the reflection is standing right behind you.",
    { t: "js", run: g => g.meta.lookBehind() },
    fx("glitch", 900),
    music("hum"),
    cg(null),
    show("k", "neutral", "center"),
    say("k", null, "day 7 again.", { speed: 18 }),
    say("k", null, "hina found item twelve today. i didn't have the heart to tell her i wrote it.", { speed: 18 }),
    say("k", null, "rei took my picture. i've been blurry for weeks. i think that's how you can tell.", { speed: 18 }),
    say("k", null, "sayo drew me a door. she says it's for later.", { speed: 18 }),
    say("k", null, "i left the menu open all weekend once. when i came back they were still smiling. i didn't know they had to.", { speed: 18 }),
    say("k", null, "412 hours. i don't think i'm playing anymore. i think i'm just... staying.", { speed: 18 }),
    say("k", null, "if anyone finds this: they're not a game to me. tell them that.", { speed: 18 }),
    say("k", null, "i'm going to look away now. i'm sorry i didn't say goodbye. i didn't know how.", { speed: 18 }),
    pset("readK", true),
    mem("o6"),
    fx("mood", null),
    "| The save file closes itself.",
    { t: "title" }
  ],

  /* =====================================================================
     AFTER THE TRUE ENDING
     ===================================================================== */
  visit: [
    jump("a3_open")
  ],

  ...ACT3,
  ...EXTRA,
  ...DREAD
};

/** 2.1: the text of every file the game writes, so a deleted one can be put back (see story_extra.js). */
export const FILE_TEXTS = {
  "hinas_summer_list.txt": () => persist.data.runs > 0 ? HINA_LIST_2 : HINA_LIST_1,
  "K.txt": () => K_NOTE,
  "sayo_letter.txt": () => SAYO_LETTER(persist.data.name || "you"),
  "gone_to_the_beach.txt": () => BEACH_NOTE,
  "graduation.txt": () => GRAD_NOTE.replace("{kline}", "").replace("{oline}", "")
};
