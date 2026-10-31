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
 * Behind the title: after the first ending, Sayo draws a door next to the menu.
 */
import { persist } from "./persist.js";

export const CAST = {
  hina: { name: "Hina", color: "#f39a52", sprite: true, expressions: ["neutral", "happy", "sad", "worried", "blush", "corrupt", "lean", "lean_blush", "list", "list_sad"] },
  rei: { name: "Rei", color: "#ad8fe6", sprite: true, expressions: ["neutral", "laugh", "annoyed", "shocked", "soft", "corrupt", "aim", "aim_shocked", "photo", "photo_soft"] },
  sayo: { name: "Sayo", color: "#5fc4b8", sprite: true, expressions: ["neutral", "sad", "scared", "happy", "blank", "corrupt", "draw", "draw_happy", "reach", "reach_blank"] },
  daichi: { name: "Daichi", color: "#6cbf6c" },
  sensei: { name: "Kanda-sensei", color: "#7d9fd6" },
  nurse: { name: "Nurse Mori", color: "#f08fb4" },
  okada: { name: "Mrs. Okada", color: "#d6a067" },
  me: { name: "", color: "#c9a6b6" },
  office: { name: "THE OFFICE", color: "#e0483c" },
  k: { name: "K", color: "#9a9a9a" }
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
  // Sayo's sketchbook
  { id: "s1", book: "sketch", title: "The box at the bottom", text: "This classroom, drawn from above. Along the bottom, a long dark box full of tiny words. 'There's always one.'", hint: "she draws when she's alone" },
  { id: "s2", book: "sketch", title: "Your face, this time", text: "A careful pencil portrait. Underneath: 'so I remember. this time.'", hint: "she wants to remember someone" },
  { id: "s3", book: "sketch", title: "Three girls in a row", text: "Three girls standing in a row, smiling at nobody. Under them, five little rectangles. 'This is where we wait.'", hint: "a place she doesn't like to talk about" },
  { id: "s4", book: "sketch", title: "Every page a door", text: "The same door, forty times. It's a little more open on every page.", hint: "the sketchbook, when she's asleep" },
  { id: "s5", book: "sketch", title: "The seat by the window", text: "An empty desk by the window, and a girl sitting at it that nobody else can see.", hint: "a Thursday" },
  { id: "s6", book: "sketch", title: "The door, open", text: "The last page. The door is open. There's light on the other side.", hint: "after the week starts again" },
  { id: "s7", book: "sketch", title: "Behind the menu", text: "Three pieces of tape on a dark floor. REI. HINA. SAYO.", hint: "she drew you a way in" },
  // Keepsakes from everyone else
  { id: "o1", book: "other", title: "Kanda-sensei's register", text: "One line has been erased so many times the paper went thin. You can still read a K.", hint: "homeroom, first thing Monday" },
  { id: "o2", book: "other", title: "Daichi's beach map", text: "A napkin. One wavy line for the sea, a big X, and BE THERE OR BE A LOSER.", hint: "Daichi has a plan" },
  { id: "o3", book: "other", title: "\"Same as yesterday?\"", text: "Mrs. Okada at the konbini by the bridge, handing over two popsicles before anyone asks.", hint: "the konbini by the bridge" },
  { id: "o4", book: "other", title: "Nurse Mori's sign-in book", text: "Every page: 'Shiraishi Sayo. Tired.' The dates go back years. They are all this week.", hint: "the infirmary" },
  { id: "o5", book: "other", title: "Sayo's letter", text: "'Thank you for sitting with me in the infirmary. It was the least tired I've ever been.'", hint: "she wanted part of her to be outside" },
  { id: "o6", book: "other", title: "K's last entry", text: "'they're not a game to me. tell them that.'", hint: "a save slot that isn't yours" },
  { id: "o7", book: "other", title: "The unknown number", text: "'is this K?' ... 'sorry. you sound like them.'", hint: "a message late on Wednesday" }
];

/* ---------- script helpers ---------- */
const bg = (id, fade = true) => ({ t: "bg", id, fade });
const music = id => ({ t: "music", id });
const sfx = id => ({ t: "sfx", id });
const show = (who, expr = "neutral", pos) => ({ t: "show", who, expr, pos });
const hide = who => ({ t: "hide", who });
const clear = { t: "clear" };
const wait = ms => ({ t: "wait", ms });
const jump = to => ({ t: "jump", to });
const set = (k, v) => ({ t: "set", k, v });
const love = (k, n = 1) => ({ t: "add", k, n });
const pset = (k, v) => ({ t: "pset", k, v });
const mem = id => ({ t: "mem", id });
const fx = (fn, ...args) => ({ t: "fx", fn, args });
const pa = (text, broken = false) => ({ t: "js", run: g => g.meta.pa(g._fill(text), { broken, template: text }) });
const day = (text, sub, wrong = false) => ({ t: "day", text, sub, wrong });
const menu = (items, opts = {}) => ({ t: "menu", items, ...opts });
const when = (fn, then, otherwise) => ({ t: "if", when: fn, then, else: otherwise });
const say = (who, expr, text, opts = {}) => ({ t: "say", who, expr, text, ...opts });
const watch = (name, on) => ({ t: "js", run: g => g.meta.setWatch(name, on) });
const log = (who, text) => ({ t: "js", run: g => g.meta.console(who, g._fill(text)) });
const noskip = on => ({ t: "noskip", on });
const end = (id, name, kind) => ({ t: "end", id, name, kind });
const phone = (title, msgs, note = "") => ({ t: "js", run: g => g.meta.phone({ title, msgs: typeof msgs === "function" ? msgs(g) : msgs, note }) });
const credits = (lines, opts) => ({ t: "js", run: g => g.meta.credits(lines.map(l => g._fill(l)), opts) });

/** Spend the afternoon with someone: plays their next scene. */
const visit = who => ({
  t: "js",
  run: g => {
    const n = (g.v.seen[who] || 0) + 1;
    g.v.seen[who] = n;
    g.v.picked.push(who);
    g.frames.push({ id: n > 3 ? `${who}4` : `${who}${n}`, i: 0 });
  }
});

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

Item thirteen: have the best summer ever. That's an order from your class rep.

Love,
Hina, Rei & Sayo
`;

/** The group chat, one night at a time. */
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
    ["rei", "there's one i'm not posting"],
    ["daichi", "is it me looking cool"],
    ["rei", "no"],
    ["hina", "8 hours of sleep tonight everyone!! training for list item 2"],
    ...(g.v.picked.at(-1) === "sayo"
      ? [["me", "Sayo says hi, by the way."], ["hina", "who? 😊"], ["rei", "hina."], ["hina", "oh!! sorry!! sayo!! of course. i don't know why i said that"]]
      : [["me", "Goodnight."]]),
    ["daichi", "3 DAYS"],
    ["rei", "it's 4 days daichi"],
    ["daichi", "i'm rounding"]
  ],
  3: g => [
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
    when((v, P) => P.runs > 0, [jump("r_start")], [jump("a1_mon")])
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
    "| When she turns the register around to mark me, I see the page. One line near the bottom has been erased so many times the paper has gone thin.",
    "| I can still make out a single letter. K.",
    mem("o1"),
    "sensei| Right. Last week. Let's all try to make it a good one.",
    "sensei| ...Hm? Sorry. I had the strangest feeling I'd already said that.",
    "| Homeroom ends. Before I can even stand up, there's a shadow over my desk.",
    "hina happy| Hey! Transfer student!",
    "| A girl with a sunflower clip in her hair drops into the seat in front of me, backwards, arms folded over the chair.",
    "hina lean| I'm Hina. Amamiya Hina. Class rep, unofficial welcoming committee, professional walker-home-of-new-people.",
    "hina neutral| Sensei said nobody's shown you around yet. Which is a crime. So! That's me now.",
    menu([
      { text: "Nice to meet you, Hina.", do: [love("hina"), "hina happy| See? Was that so hard? We're basically best friends now."] },
      { text: "I've been here three weeks.", do: ["hina blush| I know, I know. I'm late. I was working up the courage, okay?"] }
    ]),
    "hina neutral| Wait...",
    "hina worried| ...Have we met before?",
    "| She tilts her head at me like I'm a word on the tip of her tongue.",
    "hina happy| Never mind! You just have one of those faces. A summer face.",
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
    "rei laugh| Don't look so scared. I only keep the good ones.",
    "rei neutral| ...You're the transfer, right? Huh. Funny. I could swear I've already got you on a roll somewhere.",
    "hina| Rei says that about everyone.",
    "rei annoyed| I say it about everyone who's already on a roll somewhere.",
    "| Before I can ask what that means, the speaker above the blackboard clicks on.",
    pa("Good afternoon, students. This is a reminder from the Office. Summer break begins in five days. Please enjoy your last week."),
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
    "rei neutral| You say that every year.",
    "hina worried| ...Do I?",
    "daichi| She does. She says it every year and then we all get sunburnt. Tradition.",
    "| Hina laughs, and pulls a folded piece of notebook paper out of her blazer. She checks something off with a tiny, serious pen stroke.",
    "hina happy| Item one: make a new friend before summer. ...Check! Don't look at me like that. It counts.",
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
      { text: "Walk home with Hina", do: [visit("hina")] },
      { text: "Visit Rei in the darkroom", do: [visit("rei")] },
      { text: "Check on Sayo in the infirmary", do: [visit("sayo")] }
    ]),
    jump("a1_night")
  ],

  a1_night: [
    clear,
    when(v => v.day === 4, [jump("a1_night4")]),
    "| That night, my phone won't stop buzzing.",
    { t: "js", run: g => g.meta.phone({ title: "Summer Squad ☀", msgs: NIGHTS[Math.min(3, g.v.day)](g), note: "4 members" }) },
    when(v => v.day === 3, [
      "| Just as I'm putting it down, it buzzes once more. A number I don't have saved.",
      phone("+81 ··· ···· ····", [
        ["unknown", "is this K?"],
        ["me", "No. This is {name}."],
        ["unknown", "oh."],
        ["unknown", "sorry. you sound like them."],
        ["unknown", "don't stay up too late. they start counting when you stay up late."]
      ], "unknown number"),
      mem("o7"),
      "| When I try to call back, it says the number doesn't exist."
    ]),
    jump("a1_next")
  ],

  a1_night4: [
    "| Thursday night. The group chat is going off again.",
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

  a1_tue: [
    day("Tuesday", "Four days until summer break."),
    bg("classroom"),
    music("day"),
    show("rei", "neutral", "center"),
    "rei photo| Hey. Transfer. C'mere. Look at this.",
    "| Rei slides a black-and-white print across my desk. It's the photo from yesterday: me, mid-blink, Hina's elbow in the corner.",
    "rei| Behind you.",
    fx("ghost", 1600, 62),
    "| There's someone standing behind my chair. Blurred, like they moved during the whole exposure. No face. Just a shape in our uniform.",
    mem("p2"),
    "rei shocked| I didn't see anyone. Did you?",
    menu([
      { text: "It's probably a double exposure.", do: ["rei annoyed| Yeah. Old film does that. Probably. ...Probably."] },
      { text: "...Who is that?", do: [love("rei"), "rei| No idea. But you're the first person who didn't tell me it's a smudge."] }
    ]),
    "rei neutral| I'm developing the rest of the roll today. If there's more of them, I'm going to lose it.",
    show("hina", "happy", "left"),
    "hina| Morning! ...Why do you both look like you just saw a ghost?",
    "rei annoyed| Bad choice of words, Hina.",
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
    "rei neutral| Not everyone. We should invite Shiraishi sometime.",
    "daichi| Who?",
    "| Daichi says it so easily. Not mean. Just honestly blank, like she's a word he's never heard.",
    "hina worried| ...Sayo, Daichi. She sits by the window.",
    "daichi| Huh. Yeah. Sure. Sayo. ...Is there a seat by the window?",
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_wed: [
    day("Wednesday", "Three days until summer break."),
    bg("classroom"),
    music("day"),
    show("hina", "happy", "center"),
    "hina list| Item eight on the summer list: beat Daichi at something. Item nine: see the ocean. On Saturday, at the beach.",
    "hina| You're coming, right, K?",
    fx("flicker", 420),
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
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_thu: [
    day("Thursday", "Five days until summer break.", true),
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
    "hina worried| Hey... do you ever get the feeling you've already lived a day before? The exact same day, word for word?",
    "hina happy| Haha, forget it. My mom says déjà vu is just your brain hiccuping.",
    "| She swings her bag and walks a little closer to me than she needs to."
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
    "hina happy| Item four! Popsicles by the bridge! Check!",
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
    "hina sad| I think something happened once. At the beach. On a Saturday. I just can't remember which Saturday.",
    menu([
      { text: "I've got you. Let go.", do: [love("hina", 2), "| She lets go of the wall. Then she lets go of my hand. Then she's floating, on her own, staring up at the sky like she can't believe it.", "hina happy| I'm doing it! I'm DOING it! Item five! CHECK!", mem("l5")] },
      { text: "We can try again tomorrow.", do: ["hina neutral| ...Yeah. Tomorrow. There's always tomorrow, right?", "| She says it like a question she's asked a lot of times."] }
    ]),
    "| We sit on the warm concrete afterwards, dripping, sharing the last popsicle.",
    "hina happy| You're really good at summer, you know. Like, suspiciously good. Like you've done it before."
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
    "rei annoyed| I've shot thirty rolls this week.",
    "rei| ...Which is weird, because I only bought five.",
    "rei neutral| Anyway. You can come back, if you want. Nobody else likes the smell."
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
        "| She hesitates, then turns the sketchbook around. It's our classroom... drawn from somewhere that isn't a seat. From above, and in front of everything.",
        "| And along the bottom of the page, she's drawn a long dark box with lines of tiny words in it.",
        "sayo| I draw what I see when I close my eyes. There's always a box at the bottom. With words in it.",
        mem("s1")
      ] },
      { text: "Are you sick?", do: [love("sayo"), "sayo| Not sick. Just tired. Some days feel very long. Like I've lived them more than once."] }
    ]),
    "sayo| Nurse Mori is nice. She brings me tea. She asks my name every morning.",
    "sayo happy| ...Thank you for visiting. You can come back. If you want."
  ],
  sayo2: [
    bg("infirmary"),
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
    "sayo sad| And if Friday comes and I'm... different... it isn't your fault.",
    menu([
      { text: "I won't let anything happen to you.", do: [love("sayo", 2), "sayo happy| You can't promise that. But I like that you said it."] },
      { text: "What do you mean, different?", do: ["sayo blank| ...", "sayo neutral| Nothing. Forget it. Please."] }
    ])
  ],
  sayo4: [
    bg("infirmary"),
    show("sayo", "neutral", "center"),
    "| We sit by the window. Nurse Mori brings two cups of tea, sets one down in front of the empty air next to Sayo, and leaves without a word.",
    "sayo| She does that. There's always an extra cup. I think she's making tea for somebody who isn't here anymore.",
    "sayo happy| It's nice, though. It's nice to have the window. Thank you for sitting with me.",
    "| After a while Sayo falls asleep against my shoulder.",
    "| Her sketchbook slips open on the floor. Every page is the same drawing of a door. On each page, it's open a little wider.",
    mem("s4"),
    menu([
      { text: "Let her sleep", do: [love("sayo", 2), "| I don't move until the sun goes down. When she wakes up, she looks surprised that I'm still there.", "sayo happy| ...You stayed. Nobody stays."] },
      { text: "Wake her gently", do: ["sayo| Mm. Sorry. Was I... it's okay. I'm used to waking up somewhere else."] }
    ])
  ],

  /* ---------- Friday ---------- */
  a1_fri: [
    day("Friday", "Summer break begins tomorrow."),
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
    music("evening"),
    "| After class, someone asks me to meet them on the roof.",
    when(v => v.route === "hina", [jump("a1_conf_hina")]),
    when(v => v.route === "rei", [jump("a1_conf_rei")]),
    jump("a1_conf_sayo")
  ],
  a1_conf_hina: [
    show("hina", "lean_blush", "center"),
    "hina| I crossed off as much as I could this week. More than any year. Because you were there.",
    "hina| Item thirteen. I just added it. It says... 'Tell {name}.'",
    "hina| I like you. Like, a lot. Like, summer-list-item-thirteen a lot.",
    menu([{ text: "I like you too, Hina.", do: [] }, { text: "...Thirteen?", do: ["hina happy| Shut up! It's a lucky number now. I decided."] }]),
    jump("a1_break")
  ],
  a1_conf_rei: [
    show("rei", "photo_soft", "center"),
    "rei| I developed the last roll. You're sharp in all of them. Every single frame.",
    "rei| I think it's because I finally stopped looking at the thing behind you, and just looked at you.",
    "rei| ...That's the most embarrassing sentence I've ever said. Say something before I throw myself off this roof.",
    menu([{ text: "I like you too, Rei.", do: [] }, { text: "Can I get a copy?", do: ["rei laugh| You're the worst. Yes. Obviously."] }]),
    jump("a1_break")
  ],
  a1_conf_sayo: [
    show("sayo", "happy", "center"),
    "sayo| I'm not supposed to be up here. I'm not supposed to be anywhere on Fridays. But I wanted to see one sunset with you before...",
    "sayo| Before.",
    "sayo reach| I'm glad it was you this time. I really am.",
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
    show("sayo", "reach_blank", "center"),
    "sayo| ...Did you see it this time?",
    "sayo| I'm sorry. It's going to be worse next time. It always gets worse once someone notices.",
    "sayo| Look at the menu when you go back. I finished the door.",
    "sayo| Please come back anyway.",
    log("sayo", "it's not over. press 'again'. or open the door. please."),
    fx("writeFile", "K.txt", K_NOTE),
    end("rewind", "Summer Never Comes", "ENDING 1 OF 3")
  ],

  /* =====================================================================
     BEHIND THE TITLE SCREEN — through Sayo's door, after the first ending
     ===================================================================== */
  behind_title: [
    bg("void"),
    fx("mood", "still"),
    show("rei", "neutral", "farleft"),
    show("hina", "happy", "center"),
    show("sayo", "neutral", "farright"),
    "| Behind the menu there's no room. Just dark, and a floor, and the title music coming through the wall like a party next door.",
    "| They're standing exactly where they stand on the title screen. Same spots. Same smiles. There are pieces of tape on the floor with their names on them.",
    "| Nobody moves.",
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
    show("hina", "sad", "left"),
    show("rei", "shocked", "right"),
    "rei| It's in all of them now. Not just the ghost. Everything.",
    "| Rei holds up a print. It's this classroom, taken from exactly where I'm sitting. At the bottom of the photo there's a dark box with white words in it.",
    "| The words are the ones I'm reading right now.",
    watch("cursor", true),
    "rei aim_shocked| And I can see your cursor, by the way. That little arrow. It's been moving around this whole time.",
    "rei| It's very distracting.",
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
    "hina neutral| You're going to pick the first one, by the way. You always pick the first one.",
    menu([
      { text: "How do I help you?", do: [love("sayo"), "sayo happy| ...You asked. K never asked."] },
      { text: "Maybe I want to stay.", tag: "K chose this", do: ["hina sad| ...That's what K said too. At first."] }
    ]),
    when(v => v.lastChoiceIndex === 0, ["hina sad| ...See? First one."], ["hina worried| Huh. Not the first one. That's new. You're new."]),
    when(v => v.hesitate, ["rei| You hovered over '{hesitated}' for {hesitatedSecs} seconds before you picked, by the way. I saw."]),
    "sayo neutral| It watches the least in the afternoons. After class. Come find each of us. Please.",
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
    when(v => v.day === 2, [day("Tuesday", "Four days until summer break.", true),
      "daichi| Big news. Saturday. The beach. All of us. I made a map.",
      "| Same napkin. Same X. He doesn't remember showing me. He never will. He's not one of the ones who remembers."]),
    when(v => v.day === 3, [day("Wednesday", "Three days until summer break.", true)]),
    jump("r_choice")
  ],

  r_hina: [
    bg("riverside"),
    music("wrong"),
    "okada| Oh, Hina-chan. Same as yesterday?",
    "| Mrs. Okada is standing outside the konbini holding two soda popsicles. She's holding them out to the empty air.",
    "| She's been holding them like that for a long time. They aren't melting.",
    show("hina", "list", "center"),
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
    "| She unfolds the summer list. Item twelve, 'Don't let K leave', has been crossed out so hard the pen tore the paper.",
    "| Underneath it, in Hina's own handwriting, fresh:",
    "| 12. Let {name} leave.",
    "hina list_sad| I wrote that this morning. I think it's the bravest thing I've ever written.",
    { t: "js", run: async g => { g.v.listGone = !!(persist.data.wroteList && !(await g.meta.fileExists("hinas_summer_list.txt"))); } },
    when(v => v.listGone, ["hina sad| ...You threw away my list. The copy in the folder. It's okay. I wrote it again."]),
    { t: "js", run: async g => { g.v.wroteList2 = await g.meta.writeFile("hinas_summer_list.txt", HINA_LIST_2); } },
    when(v => v.wroteList2, ["hina happy| I fixed the copy in your folder too. So you have it. Out there, where it's safe."]),
    jump("r_next")
  ],

  r_rei: [
    bg("darkroom"),
    fx("mood", "red"),
    music("drone"),
    show("rei", "photo", "center"),
    "rei| Door. Close it. ...Thanks.",
    "rei| I shot a roll of the outside today. Your side.",
    "rei| This print came out exactly {screen}. That's your screen, isn't it? I took a picture of your screen.",
    "rei aim_shocked| And in the dark parts of the glass there's a reflection. A face. Lit up blue.",
    "rei| That's you, isn't it? That's what you look like from in here.",
    mem("p8"),
    "| I don't know what to say to that. Somewhere, in the room I'm actually sitting in, my own reflection is looking back at me from the screen.",
    when((v, P) => P.mem.p6, ["rei soft| The wall of shame is still up, you know. The one where I'm laughing. It survived the rewind. Don't ask me how."]),
    "rei aim| Hold still. One more. Of you, this time.",
    { t: "js", run: g => g.meta.photo({ file: "rei_photo_of_you.png", caption: "{name}, {weekday}. (behind you. always behind you.)" }) },
    when((v, P, g) => !!g.meta.native, ["rei photo| I left the print in your folder. rei_photo_of_you.png. Look at it later. Not now."]),
    "rei neutral| I finally got K in focus, too.",
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
    jump("r_next")
  ],

  r_sayo: [
    bg("infirmary"),
    music("hum"),
    "nurse| Oh! A visitor. Are you hurt? Dizzy? ...Oh. You're here for... for...",
    "| Nurse Mori is pouring tea into a cup that's already full. It's running over the edge of the desk and onto the floor, and she doesn't notice.",
    show("sayo", "draw", "center"),
    "sayo| You came. I was drawing you again.",
    "sayo| I figured it out. How the week ends.",
    "sayo| The week only ends when nobody is watching it.",
    "sayo| The Office counts every second you're here. If you look away, really away, not just closing your eyes, the clock stops. And if the clock stops long enough...",
    "sayo happy| ...maybe it's just summer.",
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
    "rei| Sayo's gone. Her desk is gone. There's no desk by the window. There's never been a desk by the window.",
    "sensei| Roll call. Amamiya. Kurosawa. Nakamura. ...And our transfer student.",
    "| She skips the line where Sayo's name was. There's no line there anymore. The register just closes over it, like water.",
    "hina sad| I remember her. I remember her, I remember her, I remem",
    fx("shake", 500),
    fx("shakeWindow", 900, 18),
    "| Something is wrong with the",
    { t: "js", run: async g => {
      g.v.crash = await g.meta.crash();
    } },
    when(v => v.crash === "close",
      ["hina sad| You tried to close it. ...It's okay. I wanted to, too.", "rei| It doesn't let you. It just turns the lights off and waits."],
      ["rei| You waited. Huh. Patient. Or stubborn."]),
    fx("jolt", 0, 140),
    show("hina", "corrupt"),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true }),
    show("rei", "corrupt"),
    say("rei", "corrupt", "Hold still.", { corrupt: true }),
    fx("glitch", 700),
    show("hina", "sad"),
    show("rei", "shocked"),
    "hina| Sorry. Sorry! It pulled us back to Monday for a second.",
    "rei| It's getting faster. Every time someone gets close to the end, it gets faster.",
    "hina worried| {name}, what do we do?",
    menu([
      { text: "Fight it." },
      { text: "Find Sayo." },
      { text: "Stay." }
    ], { hijack: "Stay.", forceIndex: 2 }),
    pa("Thank you, {name}. Your choice has been recorded."),
    "rei shocked| That wasn't you. I saw your cursor. You didn't click that.",
    "hina| Then we go get her ourselves.",
    menu([
      { text: "Go find Sayo", flee: true, do: [jump("r_find")] },
      { text: "Go find Sayo.", do: [jump("r_find")] }
    ])
  ],

  r_find: [
    clear,
    bg("infirmary"),
    music("drone"),
    "| The infirmary door is a different color than it was. Like it was painted from memory.",
    show("sayo", "corrupt", "center"),
    fx("static", 900),
    show("sayo", "reach_blank", "center"),
    "sayo| You came for me.",
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
    noskip(true),
    menu([
      { text: "Stay. Let's do the week again.", tag: "K chose this 211 times", go: "r_detention" },
      { text: "Let summer start.", go: "r_goodbye" },
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
    "| {name}! IT'S SUMMER!!! It came!",
    "| Rei says thank you for saying goodbye properly. Sayo says thank you for looking away.",
    "| I say: item thirteen, have the best summer ever. You have to do it too. That's an order from your class rep.",
    "| Please don't come back for a while. We'll be busy.",
    "| Love, H, R & S",
    fx("writeFile", "gone_to_the_beach.txt", BEACH_NOTE),
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
    end("summer", "Summer", "TRUE ENDING")
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
    day("Monday", "Five days until summer break.", true),
    bg("classroom", false),
    music("wrong"),
    show("hina", "corrupt", "center"),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true }),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true, speed: 70 }),
    say("hina", "corrupt", "Hey! Transfer student!", { corrupt: true, speed: 90 }),
    fx("mood", null),
    end("detention", "Detention", "BAD ENDING")
  ],

  /* =====================================================================
     THE K SAVE — reachable from the Load screen after the first ending
     ===================================================================== */
  k_save: [
    clear,
    bg("classroom"),
    fx("mood", "wrong"),
    music("hum"),
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
    bg("beach"),
    music("musicbox"),
    "| The beach is empty. There's a sign on the pier.",
    "| CLOSED FOR SUMMER VACATION.",
    "| Somewhere far down the shore, three people are laughing. They don't look back.",
    "| That's okay. That's the point.",
    { t: "title" }
  ]
};
