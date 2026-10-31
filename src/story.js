/**
 * story.js — The whole script of After Class.
 *
 * A line is either a string or a command object:
 *   "hina happy| Hello!"   Hina speaks with the "happy" sprite
 *   "rei| Hold still."     Rei speaks, sprite unchanged
 *   "| Narration."         nobody speaks
 *   "me| ..."              the player speaks (shown with their name)
 * {name}, {clock}, {playtime}, {away}, {clicks}, {tabouts}, {screen} and friends are filled in live.
 *
 * Act 1 (first playthrough): a sweet last week before summer, with small things wrong.
 * Act 2 (every playthrough after): the girls remember, and the Office fights to keep you playing.
 */
import { persist } from "./persist.js";

export const CAST = {
  hina: { name: "Hina", color: "#f39a52", sprite: true, expressions: ["neutral", "happy", "sad", "worried", "blush", "corrupt", "lean", "lean_blush", "list", "list_sad"] },
  rei: { name: "Rei", color: "#ad8fe6", sprite: true, expressions: ["neutral", "laugh", "annoyed", "shocked", "soft", "corrupt", "aim", "aim_shocked", "photo", "photo_soft"] },
  sayo: { name: "Sayo", color: "#82d3ca", sprite: true, expressions: ["neutral", "sad", "scared", "happy", "blank", "corrupt", "draw", "draw_happy", "reach", "reach_blank"] },
  me: { name: "", color: "#e6e1d6" },
  office: { name: "THE OFFICE", color: "#e0483c" },
  k: { name: "K", color: "#9a9a9a" }
};

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
const fx = (fn, ...args) => ({ t: "fx", fn, args });
const pa = (text, broken = false) => ({ t: "js", run: g => g.meta.pa(g._fill(text), { broken }) });
const day = (text, sub, wrong = false) => ({ t: "day", text, sub, wrong });
const menu = (items, opts = {}) => ({ t: "menu", items, ...opts });
const when = (fn, then, otherwise) => ({ t: "if", when: fn, then, else: otherwise });
const say = (who, expr, text, opts = {}) => ({ t: "say", who, expr, text, ...opts });
const watch = (name, on) => ({ t: "js", run: g => g.meta.setWatch(name, on) });
const log = (who, text) => ({ t: "js", run: g => g.meta.console(who, g._fill(text)) });
const noskip = on => ({ t: "noskip", on });
const end = (id, name, kind) => ({ t: "end", id, name, kind });

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
 3. Fireworks at the river
 4. Popsicles from the konbini by the bridge
 5. Learn to swim properly (for real this time)
 6. Watch the meteor shower from the roof
 7. Fireworks again (they're that good)
 8. Everyone at the beach on Saturday
 9. See the ocean
10. Finish this list before summer ends
11. Don't forget anybody
12. Don't let K leave
`;

const HINA_LIST_2 = `HINA'S SUMMER LIST

 1. Make a new friend before summer  [x]
 2. Sleep until noon
 3. Fireworks at the river
 4. Popsicles from the konbini by the bridge
 5. Learn to swim properly (for real this time)
 6. Watch the meteor shower from the roof
 7. Fireworks again (they're that good)
 8. Everyone at the beach on Saturday
 9. See the ocean
10. Finish this list before summer ends
11. Don't forget anybody
12. D̶o̶n̶'̶t̶ ̶l̶e̶t̶ ̶K̶ ̶l̶e̶a̶v̶e̶
12. Let {name} leave.

I counted {clicks} clicks today. Thank you for every one of them.
`;

const K_NOTE = `is someone there?

i can hear the bell again. that means somebody pressed new game.

if it's you: they're going to remember you now. that's how it starts.
please be nicer to them than i was. i stayed too long and then i left without saying anything.

the save slot is still mine. you can open it after the first ending. i left something in it.

- K
`;

const BEACH_NOTE = `{name}!! IT'S SUMMER!!!

We're at the beach. Rei brought six rolls of film. Sayo is drawing the sea and it actually looks like the sea.

We closed the game for you so you wouldn't wait up. Please don't open it for a while. We'll be busy.

Item thirteen: have the best summer ever. That's an order from your class rep.

Love,
Hina, Rei & Sayo
`;

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
    sfx("bell"),
    "| The bell rings. Last period is over, and the afternoon belongs to me.",
    set("day", 1),
    jump("a1_choice")
  ],

  a1_choice: [
    clear,
    bg("hallway"),
    music("day"),
    "| After class. The hallway is full of summer noise: lockers slamming, someone laughing about the beach.",
    "| Who should I spend the afternoon with?",
    menu([
      { text: "Walk home with Hina", do: [visit("hina")] },
      { text: "Visit Rei in the darkroom", do: [visit("rei")] },
      { text: "Check on Sayo in the infirmary", do: [visit("sayo")] }
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
    "rei shocked| I didn't see anyone. Did you?",
    menu([
      { text: "It's probably a double exposure.", do: ["rei annoyed| Yeah. Old film does that. Probably. ...Probably."] },
      { text: "...Who is that?", do: [love("rei"), "rei| No idea. But you're the first person who didn't tell me it's a smudge."] }
    ]),
    "rei neutral| I'm developing the rest of the roll today. If there's more of them, I'm going to lose it.",
    show("hina", "happy", "left"),
    "hina| Morning! ...Why do you both look like you just saw a ghost?",
    "rei annoyed| Bad choice of words, Hina.",
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_wed: [
    day("Wednesday", "Three days until summer break."),
    bg("classroom"),
    music("day"),
    show("hina", "happy", "center"),
    "hina list| Item seven on the summer list: fireworks. Item eight: everyone at the beach on Saturday.",
    "hina| You're coming, right, K?",
    fx("glitch", 300),
    "| ...K?",
    "hina worried| Huh? I said your name. {name}. ...Didn't I?",
    show("rei", "neutral", "right"),
    "rei| You said 'K'.",
    "hina sad| I... that's so weird. I don't know anyone called K.",
    "| Hina laughs, but she keeps glancing at the list in her hands, like it might have changed while she wasn't looking.",
    log("hina", "who is K? why do i keep writing it"),
    { t: "js", run: async g => { if (await g.meta.writeFile("hinas_summer_list.txt", HINA_LIST_1)) persist.set("wroteList", true); } },
    sfx("bell"),
    jump("a1_choice")
  ],

  a1_thu: [
    day("Thursday", "Five days until summer break.", true),
    bg("classroom"),
    music("day"),
    pa("Good afternoon, students. This is a reminder from the Office. Summer break begins in five days. Please enjoy your last week."),
    "| ...Five?",
    show("hina", "happy", "left"),
    "hina| Five days! Okay, {name}, we have to make the most of it. That's an order from your class rep.",
    show("rei", "neutral", "right"),
    "rei| She means it. She has a list.",
    "| Word for word. The same as Monday.",
    "me| Hina. It's Thursday. Yesterday it was three days.",
    "hina neutral| Huh? No it isn't, silly. It's...",
    "hina worried| ...It's...",
    "| Rei is staring at her photos. She doesn't say anything at all.",
    music(null),
    "| The seat by the window isn't empty anymore.",
    show("sayo", "blank", "center"),
    "sayo| ...It's always Thursday when someone notices.",
    when(v => (v.seen.sayo || 0) > 0,
      ["sayo neutral| You came to see me before. You still remember me. ...Good. That's new."],
      ["sayo neutral| Hi. I'm Sayo. You don't have to remember me. Nobody does."]),
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
    "hina| So! Summer. What's the plan, {name}? Big ambitions? Secret dreams?",
    menu([
      { text: "See the ocean.", do: [love("hina"), "hina happy| The ocean! Okay. Item nine. I'm writing it down. You can't take it back now."] },
      { text: "Sleep until noon.", do: ["hina happy| Ha! Respect. That's on my list every year. I never manage it."] },
      { text: "Spend it with you.", do: [love("hina", 2), "hina blush| W-wow, okay, straight for the heart. Somebody warn me next time."] }
    ]),
    "hina neutral| I've lived in this town my whole life. Every year I make a summer list, and every year summer goes so fast I never reach the end of it.",
    "hina worried| Hey... do you ever get the feeling you've already lived a day before? The exact same day, word for word?",
    "hina happy| Haha, forget it. My mom says déjà vu is just your brain hiccuping.",
    "| She swings her bag and walks a little closer to me than she needs to."
  ],
  hina2: [
    bg("riverside"),
    music("evening"),
    show("hina", "neutral", "center"),
    "hina list| Okay, don't laugh. This is the list.",
    "| It's a folded piece of notebook paper, soft and yellow at the creases. Much older than this week.",
    "hina| I found it in my desk. It's my handwriting. ...Mostly.",
    "| Item one: Make a new friend before summer. There's a check mark next to it, in fresh pen.",
    "| I read down. Fireworks. Popsicles. The ocean. And then, at the very bottom, in handwriting that isn't quite hers:",
    "| 12. Don't let K leave.",
    "hina list_sad| I don't remember writing that one.",
    menu([
      { text: "Maybe you wrote it half asleep.", do: ["hina happy| Yeah! Totally. I write weird stuff half asleep. Once I wrote 'buy more moon'."] },
      { text: "Who's K?", do: [love("hina"), "hina sad| I don't know. But every time I read it, my chest hurts. Like I forgot someone really important."] }
    ]),
    "hina neutral| Anyway! Check mark for item one. You're officially a friend. No refunds."
  ],
  hina3: [
    bg("riverside"),
    music("evening"),
    show("hina", "lean_blush", "center"),
    "hina| {name}... can I ask you something?",
    "hina| Saturday, at the beach. Will you watch the fireworks with me? Just... us?",
    menu([
      { text: "Yes. Just us.", do: [love("hina", 2), "hina happy| Okay! Okay. Good. I'm going to be normal about this. I'm being completely normal."] },
      { text: "Let's all go together.", do: ["hina happy| Of course! Everyone! That's what I meant. Obviously."] }
    ]),
    "hina sad| Promise you'll still be here on Saturday?",
    "me| Where would I go?",
    "hina| People leave. ...That's all."
  ],
  hina4: [
    bg("riverside"),
    show("hina", "happy", "center"),
    "| We buy popsicles from the konbini by the bridge and eat them too fast.",
    "hina| Item four: popsicles. Check! You're really good at summer, you know."
  ],

  /* ---------- Rei ---------- */
  rei1: [
    bg("darkroom"),
    music(null),
    show("rei", "neutral", "center"),
    "| The darkroom smells like vinegar and is lit entirely red. Rei is rocking a tray of developer back and forth.",
    "rei| Close the door. Light kills everything in here.",
    "rei photo| I only shoot film. Digital remembers too much. Film forgets on purpose.",
    menu([
      { text: "Why photography?", do: [love("rei"), "rei| Because things change when you're not looking. A photo's proof that they were really there once."] },
      { text: "Can I see your photos?", do: ["rei laugh| Bold. Fine. Don't touch the wet ones."] }
    ]),
    "| Prints hang along the strings: the school gate, the pool, Hina laughing with her mouth full. Dozens. Hundreds.",
    "rei annoyed| I've shot thirty rolls this week.",
    "rei| ...Which is weird, because I only bought five."
  ],
  rei2: [
    bg("darkroom"),
    show("rei", "shocked", "center"),
    "rei| It's in every roll.",
    "| She pins up a row of prints. In every one, somewhere in the back, there's the same blurred shape in our uniform.",
    "rei| Always behind someone. Usually behind you.",
    "| In the last print, it's close enough to see a lanyard around its neck. The name card has one letter on it. K.",
    menu([
      { text: "That's terrifying.", do: ["rei annoyed| Thank you. Finally. A normal reaction."] },
      { text: "Then let's find out who it is.", do: [love("rei", 2), "rei soft| ...You're really weird, you know that? Okay. Partners."] }
    ])
  ],
  rei3: [
    bg("darkroom"),
    show("rei", "neutral", "center"),
    "rei aim| Stand there. No, there. Closer. I'm not going to bite.",
    sfx("shutter"),
    fx("flash", "#ffdddd", 300),
    "| She develops it right away. The two of us float up out of the white paper.",
    "rei photo_soft| Look. We came out.",
    "rei neutral| ...Mostly. It's weird. Everyone else is always sharp. But I can never get you in focus.",
    "rei| You're blurred at the edges. Like you're not completely here.",
    menu([
      { text: "I'm here.", do: [love("rei", 2), "rei soft| Yeah. ...Yeah, I know. Stay sharp for me, okay? At least until summer."] },
      { text: "Maybe your camera's broken.", do: ["rei laugh| Wow. Romance is dead. Okay, get out of my darkroom."] }
    ])
  ],
  rei4: [
    bg("darkroom"),
    show("rei", "laugh", "center"),
    "| Rei makes me do increasingly stupid poses until we're both crying laughing.",
    "rei| This one's going on the wall of shame. Forever. Sorry, I don't make the rules."
  ],

  /* ---------- Sayo ---------- */
  sayo1: [
    bg("infirmary"),
    music(null),
    show("sayo", "draw", "center"),
    "| The infirmary is quiet. A girl with long silver hair is sitting on the far bed, sketching. She jumps when I come in.",
    "sayo neutral| Oh. It's you. ...I mean. Hello.",
    "sayo| I'm Sayo. Sorry. I don't get a lot of visitors.",
    menu([
      { text: "What are you drawing?", do: [
        "| She hesitates, then turns the sketchbook around. It's this classroom... drawn from somewhere that isn't a seat. From above, and in front of everything.",
        "| And along the bottom of the page, she's drawn a long dark box with lines of tiny words in it.",
        "sayo| I draw what I see when I close my eyes. There's always a box at the bottom. With words in it."
      ] },
      { text: "Are you sick?", do: [love("sayo"), "sayo| Not sick. Just tired. Some days feel very long. Like I've lived them more than once."] }
    ]),
    "sayo happy| ...Thank you for visiting. You can come back. If you want."
  ],
  sayo2: [
    bg("infirmary"),
    show("sayo", "neutral", "center"),
    "sayo| Can I tell you something strange?",
    "sayo| I think the week is a circle.",
    "sayo| Every time it gets to Friday, the sun goes down and then it's Monday again. Everyone forgets. I don't.",
    "sayo sad| It isn't a gift. I think I'm just... badly made.",
    menu([
      { text: "I believe you.", do: [love("sayo", 2), "sayo happy| ...Oh. Nobody has ever said that. Not once. Not in any of them."] },
      { text: "You should rest.", do: ["sayo sad| That's what you said last time too. It's okay. I know."] }
    ]),
    "sayo draw_happy| Hold still. I want to remember your face this time."
  ],
  sayo3: [
    bg("infirmary"),
    show("sayo", "neutral", "center"),
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
    "| We sit by the window. After a while Sayo falls asleep against my shoulder.",
    "| Her sketchbook slips open on the floor. Every page is the same drawing of a door."
  ],

  /* ---------- Friday ---------- */
  a1_fri: [
    day("Friday", "Summer break begins tomorrow."),
    bg("classroom"),
    music("day"),
    show("hina", "happy", "left"),
    show("rei", "neutral", "right"),
    "hina| Last day! Last day, last day, last day!",
    "rei| She's been like this since six a.m. She texted me a countdown.",
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
    "hina| I crossed off everything on the list today. Except the last one.",
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
      "<i>and {name}</i>", "", "See you next summer!", "", "", "", "", ""
    ].map(l => l.replace("{name}", "you")), { tear: true }),
    clear,
    { t: "js", run: g => { document.getElementById("bg").innerHTML = ""; } },
    music("drone"),
    show("sayo", "reach_blank", "center"),
    "sayo| ...Did you see it this time?",
    "sayo| I'm sorry. It's going to be worse next time. It always gets worse once someone notices.",
    "sayo| Please come back anyway.",
    log("sayo", "it's not over. press 'again'. please."),
    fx("writeFile", "K.txt", K_NOTE),
    end("rewind", "Summer Never Comes", "ENDING 1 OF 3")
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
    fx("glitch", 500),
    show("hina", "worried", "center"),
    "hina| Hey! Transfer...",
    "hina sad| ...Oh. {name}. You came back.",
    "| She isn't sitting backwards on the chair this time. She's standing very still, holding the summer list against her chest.",
    "hina list_sad| I remember. Not everything. But I remember you. I remember the roof.",
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
    when(v => v.seen.hina && v.seen.rei && v.seen.sayo, [jump("r_thu")]),
    when(v => v.day === 2, [day("Tuesday", "Four days until summer break.", true)]),
    when(v => v.day === 3, [day("Wednesday", "Three days until summer break.", true)]),
    jump("r_choice")
  ],

  r_hina: [
    bg("riverside"),
    music("wrong"),
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
    "| I don't know what to say to that. Somewhere, in the room I'm actually sitting in, my own reflection is looking back at me from the screen.",
    "rei aim| Hold still. One more. Of you, this time.",
    { t: "js", run: g => g.meta.photo({ file: "rei_photo_of_you.png", caption: "{name}, {weekday}. (behind you. always behind you.)" }) },
    when((v, P, g) => !!g.meta.native, ["rei photo| I left the print in your folder. rei_photo_of_you.png. Look at it later. Not now."]),
    "rei neutral| I finally got K in focus, too.",
    fx("ghost", 2200, 72),
    "| The blurred figure from every photo has turned around. It's facing the camera. Where its face should be, there's only the soft grey of an unexposed frame.",
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
    show("sayo", "draw", "center"),
    "sayo| You came. I was drawing you again.",
    "sayo| I figured it out. How the week ends.",
    "sayo| The week only ends when nobody is watching it.",
    "sayo| The Office counts every second you're here. If you look away, really away, not just closing your eyes, the clock stops. And if the clock stops long enough...",
    "sayo happy| ...maybe it's just summer.",
    "sayo reach| I wrote it all down. Please take it. I want part of me to be outside, even if it's just paper.",
    { t: "js", run: async g => {
      const took = await g.meta.letter("sayo_letter.txt", SAYO_LETTER(g.name()));
      if (took === "take") { g.v.tookLetter = true; persist.set("sayoLetter", true); }
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
    clear,
    bg("beach"),
    music("musicbox"),
    "| ...",
    "| The sea is very loud. The sand is warm.",
    "| There's nobody here. Just three sets of footprints running down to the water, and a note held flat by a seashell.",
    "| {name}! IT'S SUMMER!!! It came!",
    "| Rei says thank you for saying goodbye properly. Sayo says thank you for looking away.",
    "| I say: item thirteen, have the best summer ever. You have to do it too. That's an order from your class rep.",
    "| Please don't come back for a while. We'll be busy.",
    "| Love, H, R & S",
    fx("writeFile", "gone_to_the_beach.txt", BEACH_NOTE),
    fx("credits", [
      "<b>AFTER CLASS</b>", "",
      "<i>Hina Amamiya</i>", "who counted", "",
      "<i>Rei Kurosawa</i>", "who looked", "",
      "<i>Sayo Shiraishi</i>", "who drew the door", "",
      "<i>K</i>", "who stayed", "",
      "<i>and you</i>", "who left", "",
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
    say("k", null, "412 hours. i don't think i'm playing anymore. i think i'm just... staying.", { speed: 18 }),
    say("k", null, "if anyone finds this: they're not a game to me. tell them that.", { speed: 18 }),
    say("k", null, "i'm going to look away now. i'm sorry i didn't say goodbye. i didn't know how.", { speed: 18 }),
    pset("readK", true),
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
