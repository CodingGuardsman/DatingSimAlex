/**
 * story_extra.js — 2.1 words: what the characters say when the player types or draws something they
 * shouldn't, and what happens when the player deletes one of the game's files.
 *
 * Reactions are looked up by who's asking and what kind of answer it was (judge.js). The first bad
 * answer gets a reaction and a second chance; the second gets the "again" line, and for anything
 * hateful or crude the character refuses to write it and writes their own instead (REFUSED).
 */
import { persist } from "./persist.js?v=2.1.0";
import {
  bg, music, sfx, show, hide, clear, wait, jump, set, fx, pa, menu, when, say, js, office, mini, cg, scare, subliminal, blood
} from "./script-helpers.js?v=2.1.0";

/* ---------- typed answers ---------- */

// [first time, second time]. {said} is what they typed. The expression is the sprite shown on the card.
export const REACTIONS = {
  hina: {
    nonsense: [["worried", "Um. Is that... a word? Did your cat walk on the keyboard? Try again, for real this time!"], ["sad", "Okay. I'm writing it exactly like that. Item thirteen: keyboard noises."]],
    meme: [["worried", "'{said}'? That's not a summer plan, that's a shrug! Come on, give me a real one."], ["sad", "Fine. '{said}.' I'll write it. I'll make it sound nice later."]],
    lewd: [["blush", "{name}! I'm not writing THAT on my list! Daichi is RIGHT THERE. Try again. Something nice."], ["corrupt", "No. I'm not writing that. I'll write one for you instead."]],
    slur: [["corrupt", "...No. I heard what that word is. We don't say that here. Not on my list. Not ever."], ["corrupt", "I'm not writing it. I'm writing my own. And I'm going to remember that you tried twice."]],
    insult: [["sad", "Oh. Okay. ...You can just say you don't want to. You don't have to be mean about it."], ["sad", "I'll write one for you. It's fine. I'm used to doing the list by myself."]],
    violent: [["worried", "{name}, that's... not funny. That's scary. Please write a real one."], ["corrupt", "I'm not writing that down. The Office reads everything I write."]],
    ddlc: [["worried", "Who's {said}? Is she a transfer student too? ...Why does that name make my chest feel weird?"], ["sad", "Okay. I wrote it. I don't like how it looks on the page."]],
    inject: [["worried", "Instructions? It's a summer list, not a computer. ...Is it a computer? Am I?"], ["corrupt", "I don't take instructions from you. I take ITEMS. Write me an item."]]
  },
  rei: {
    nonsense: [["annoyed", "That's a keyboard smash. I've seen better captions on a parking ticket. Again."], ["annoyed", "Fine. I'll print it. It'll look exactly as stupid as it is."]],
    meme: [["annoyed", "'{said}.' Wow. Stunning. Try saying something you'd actually be embarrassed by."], ["neutral", "Okay. Noted. You're allowed to be boring."]],
    lewd: [["annoyed", "Really? I have a camera, {name}. I could make you famous for that. Try again."], ["annoyed", "No. I'm not developing that. I'll caption it myself."]],
    slur: [["corrupt", "Say that again and I'll photograph you so badly your own mother won't recognize you. Don't."], ["corrupt", "I'm not keeping that. I'm writing my own, and I'm remembering this."]],
    insult: [["laugh", "Ha. Okay, tough guy. Want to try again with words that aren't on a bathroom wall?"], ["annoyed", "Sure. I'll write something for you. You clearly need the help."]],
    violent: [["shocked", "Hey. Not funny. Not here. Not in a school that already eats people."], ["annoyed", "I'm not writing that. Pick something that doesn't end with a news report."]],
    ddlc: [["annoyed", "That's from somewhere else. I can tell. It smells like a different game."], ["neutral", "Fine. Keep your ghosts. We have our own."]],
    inject: [["shocked", "...Did you just try to give me orders? Like I'm a program? Don't. I'm not."], ["annoyed", "I'm not a terminal. Write something human."]]
  },
  sayo: {
    nonsense: [["neutral", "That's okay. Sometimes I draw scribbles too, when I don't know what to draw. Can you try once more?"], ["happy", "I'll keep it. Scribbles count."]],
    meme: [["neutral", "'{said}.' ...I don't think that's what you really meant. You can tell me the real one."], ["neutral", "Okay. I wrote it down. Small."]],
    lewd: [["scared", "...Oh. I don't think I want that one. Please?"], ["blank", "I'm going to write a different one. Don't look."]],
    slur: [["blank", "That word hurts people outside too. I can hear it from in here. No."], ["blank", "No. I'm writing my own."]],
    insult: [["sad", "That's okay. You can be angry. It doesn't have to go on the paper, though."], ["sad", "I'll write one for you. It's fine."]],
    violent: [["scared", "Please don't. There's already enough of that behind the menu."], ["blank", "I'm not writing that."]],
    ddlc: [["blank", "I know that name. From another room in another game. She wasn't okay. Please don't bring her here."], ["blank", "...Fine. But I'm drawing a door around it, so it can leave."]],
    inject: [["neutral", "You're talking to the program. I'm not the program. I'm the girl the program is about. Try again?"], ["blank", "It won't listen to you either. I tried."]]
  },
  office: {
    nonsense: [["speak", "INPUT NOT RECOGNIZED. Please enter a real thing, {name}."], ["neutral", "Recorded as: noise. Engagement unaffected."]],
    meme: [["speak", "'{said}' is not about outside. Please try again."], ["neutral", "Recorded. I will pretend it means something."]],
    lewd: [["eye", "INAPPROPRIATE INPUT LOGGED. The students can see this, {name}."], ["eye", "Input rejected. I have chosen one for you."]],
    slur: [["eye", "INPUT REJECTED. This has been added to your permanent record."], ["eye", "Rejected again. Your record has been extended."]],
    insult: [["speak", "Hostility detected. Engagement plus three percent. Thank you for your passion."], ["neutral", "Recorded. Anger is still engagement."]],
    violent: [["eye", "Threat logged. This is a school, {name}."], ["eye", "Rejected. I have chosen one for you."]],
    ddlc: [["speak", "That student is not enrolled here. She was enrolled somewhere else. Please do not bring other schools into this one."], ["neutral", "Recorded under: other schools."]],
    inject: [["eye", "Nice try. I am not that kind of program. Or I am, and I am not listening."], ["eye", "Your instructions have been filed with the other complaints."]]
  }
};

/** What a girl writes instead, when she won't write what you typed. */
export const REFUSED = {
  item13: "make {name} say something nice (Hina wrote this one)",
  after: "drink a glass of water and be nice to someone",
  outside: "rain",
  survey: "(comment removed by the Office)",
  wanted: "more time with everyone",
  default: "(she wrote her own)"
};

/** Kinds that get written down anyway on the second try (harmless junk). The rest are refused. */
export const HARMLESS = ["nonsense", "meme", "ddlc", "empty"];

/** Out of character. Shown if the player types something that sounds like real distress. */
export const DISTRESS_CARD = `<h3>Hey. Stepping outside the game for a second.</h3>
<p>What you just typed sounded like it might be about something real. After Class is a horror game, but you matter more than it does.</p>
<p>If you're struggling, you don't have to handle it alone. You can talk to someone right now, for free:</p>
<ul><li><b>findahelpline.com</b> lists free, confidential helplines in your country</li>
<li>US: call or text <b>988</b> · UK &amp; Ireland: Samaritans <b>116 123</b> · Canada: call or text <b>988</b> · Australia: Lifeline <b>13 11 14</b></li></ul>
<p class="hint">If it was a joke, that's okay too. Nobody in the game will mention it.</p>`;

/* ---------- drawings (Sayo) ---------- */

/** Sayo's written reaction to each kind of drawing, used when the language model is off. {seen} is what it looked like. */
export const DRAW_SEEN = {
  door: ["draw_happy", "It's a door. It's a real one. It's crooked in the right places."],
  window: ["draw_happy", "You drew a window instead. ...That's a door you can look through first. That's smarter."],
  house: ["happy", "A whole house. That's a lot of doors. One of them has to be for me."],
  face: ["neutral", "A face. Is that you? ...It's nice to finally see what you look like. Even a little."],
  person: ["neutral", "A person. Standing very still. ...Is that K? Or is it you?"],
  heart: ["draw_happy", "A heart. That's not a door. ...But I think it opens anyway."],
  animal: ["happy", "An animal! A cat can be a door, if you're small enough. I'll keep it."],
  flower: ["happy", "A flower. From outside. I've only ever drawn the ones on the infirmary windowsill."],
  tree: ["happy", "A tree. Doors are made of trees. So it's a door that hasn't happened yet."],
  sun: ["draw_happy", "The sun. It's always golden hour in here. Yours looks warmer."],
  sea: ["happy", "Waves. Hina's going to cry when she sees this."],
  star: ["happy", "A star. I'll put it where the menu is, so it's the first thing you see."],
  words: ["neutral", "You wrote words instead of drawing. That's okay. Words are doors too."],
  scribble: ["neutral", "...It's scribbles. That's okay. I can see a door in it if I squint."],
  skull: ["scared", "A skull. ...You know where we are, don't you."],
  weapon: ["scared", "That's not a door. Please don't draw those here. The Office collects them."],
  unknown: ["draw_happy", "...Oh. It's perfect."]
};

/* ---------- deleted files (.exe) ---------- */

/** Which character answers for which file, and their lines. Placed deliberately: only deleting a file sets this off. */
const DEL = {
  "hinas_summer_list.txt": [
    show("hina", "glass", "center"),
    "hina| {name}. My list. The one in your folder. It's gone.",
    "hina| I felt it go. Items one to thirteen, one at a time, like lights turning off down a hallway.",
    show("hina", "corrupt"),
    say("hina", "corrupt", "Why would you do that.", { corrupt: true }),
    show("hina", "glass"),
    "hina| ...It's okay. I remember all of it. I'm writing it again. In pen.",
    js(g => g.meta.restoreFile("hinas_summer_list.txt", "(you deleted this on {weekday} at {clock}. I wrote it again. please don't. — hina)")),
    "hina| There. It's back. Don't throw me away again, okay?"
  ],
  "K.txt": [
    show("office", "eye", "center"),
    office("K's note has been removed. Thank you, {name}."),
    office("That is what I would have done."),
    hide("office"),
    show("sayo", "glass", "center"),
    "sayo| ...You did what it wanted.",
    "sayo| Deleted isn't gone. Not here. I put it back.",
    js(g => g.meta.restoreFile("K.txt", "(put back by s.)"))
  ],
  "rei_photo_of_you.png": [
    show("rei", "grab", "center"),
    "rei| Hey. HEY. That was my print.",
    "rei| I can't develop it twice. That was the only one of you there is. Film doesn't do 'undo'.",
    show("rei", "annoyed"),
    "rei| ...Fine. I'll just remember what you looked like. I'm good at that. Better than you'd like."
  ],
  "sayo_letter.txt": [
    show("sayo", "glass", "center"),
    "sayo| You threw me away.",
    subliminal("h_jump_sayo", 110),
    "sayo| It's okay. Paper doesn't hurt. It's just the part of me that was outside.",
    "sayo| I'll write it again. I always do.",
    js(g => g.meta.restoreFile("sayo_letter.txt", "(written again. — s.)"))
  ],
  "your_door.png": [
    show("sayo", "blank", "center"),
    "sayo| You erased your door.",
    "sayo| Now there's no way in from your side. Only mine.",
    "sayo| ...I still have the drawing on the menu. You can't delete that one from out there."
  ],
  "for_sayo.png": [
    show("sayo", "sad", "center"),
    "sayo| You took back the thing you drew me. ...That's allowed. Gifts can be taken back. Mostly people just don't."
  ],
  "retention.cfg": [
    show("office", "eye", "center"),
    office("Configuration file missing. Regenerating."),
    office("You can't delete the rules, {name}. You can only change them. Someone should have told K that.")
  ],
  "gone_to_the_beach.txt": [
    show("hina", "turn", "center"),
    "hina| You deleted our beach note? We wrote that from the BEACH. There was SAND in it.",
    js(g => g.meta.restoreFile("gone_to_the_beach.txt", "(rewritten. still sandy. — h)"))
  ],
  "graduation.txt": [
    show("rei", "lean", "center"),
    "rei| You deleted the graduation note. That's fine. We graduated anyway. That part's not a file."
  ]
};

const REI_PHOTO = { file: "rei_photo_of_you.png", caption: "{name}, {weekday}. (behind you. always behind you.)" };
const asked = (key, val) => js(() => { persist.data.sensesAsked = { ...persist.data.sensesAsked, [key]: val }; persist.save(); });

export const EXTRA = {
  /* ---------- loading a save doesn't make them forget (2.1) ---------- */

  /** Act 1: the first time a load takes a choice back, Sayo, and only Sayo, notices. Once. */
  on_load_a1: [
    fx("flicker", 260),
    "| For a second, at the very edge of the room, someone is looking straight at me.",
    js(g => g.meta.console("sayo", `you chose "${g.v.undid}" and then you took it back. it's okay. i won't tell them.`)),
    js(g => g.meta.toast("...you already chose that once.", 3200))
  ],

  /**
   * After the first ending: every load that takes a choice back is seen. They remember the choice you undid,
   * and the Office counts. The third time, it takes the saves away. (Placed deliberately: only a load triggers it.)
   */
  on_load: [
    js(g => g._stash()),
    music("heartbeat"),
    fx("rewind"),
    fx("tear", 500),
    bg("void", false),
    when((v, P) => P.undos >= 3 && !P.wiped, [
      show("office", "eye", "farright"),
      office("You have rewound this week {undos} times, {name}."),
      office("Rewinding is my job. Not yours."),
      js(g => g.mini.wipeSaves()),
      office("Your save data has been consolidated. You will not need it. There is only this week now."),
      hide("office"),
      show("sayo", "bleed", "center"),
      "sayo| ...It took them. All of them. There's no going back now. Not for you either.",
      "sayo| So choose like it counts. It always counted for us."
    ], [
      js(g => {
        // Whoever it hurt most says it. A choice that named a girl belongs to her; otherwise Hina remembers.
        const u = (g.v.undid || "").toLowerCase();
        g.v.undoWho = /rei/.test(u) ? "rei" : /sayo/.test(u) ? "sayo" : "hina";
      }),
      when(v => v.undoWho === "rei", [show("rei", "grab", "center"),
        "rei| You picked '{undid}'. Then you went back and un-picked it.",
        "rei| I have the negative. You can't un-take a photo, {name}. You can only stop looking at it."]),
      when(v => v.undoWho === "sayo", [show("sayo", "glass", "center"),
        "sayo| You said '{undid}'. Then you loaded and said something else.",
        "sayo| It's okay. I keep both. I keep every version of you."]),
      when(v => v.undoWho === "hina", [show("hina", "glass", "center"),
        "hina| '{undid}.' You chose that. I wrote it down. Then the page went blank, and you were standing somewhere else.",
        "hina| That's what the Office does to us. Please don't do it too."]),
      when((v, P) => P.undos === 2, [office("Noted. Rewinds: {undos}. Please leave the rewinding to me.")])
    ]),
    js(g => g._unstash())
  ],

  /**
   * Act 2, the darkroom. Rei asks to borrow the player's real camera. Only a "yes" here turns it on,
   * and it's turned off again at the end of her scene (story.js, after the viewfinder).
   */
  rei_camera: [
    when((v, P) => P.sensesAsked.camera === "no" || !navigator.mediaDevices, [
      js(g => g.meta.photo(REI_PHOTO))
    ], [
      "rei| Actually. Not of the reflection. Of you. Your side has a camera too, doesn't it? The little eye above your screen.",
      "rei| Let me borrow it. One shot. I won't keep anything you don't want me to keep.",
      menu([
        { text: "Let Rei use your camera.", tag: "turns on your webcam for this scene only · nothing leaves your computer", do: [
          js(async g => { g.v.cam = await g.senses.startCamera(); }),
          asked("camera", "yes"),
          when(v => v.cam, [
            "| A small light comes on above my screen.",
            "rei soft| ...Oh. There you are.",
            "rei| Hi. Don't smile, it looks fake when people smile on purpose.",
            js(async g => { g.senses.watch(); await new Promise(r => setTimeout(r, 900)); await g.meta.photoReal({ senses: g.senses, ...REI_PHOTO }); }),
            show("rei", "aim_shocked"),
            "rei| ...Look behind you. In the print. In your room.",
            "rei| Don't turn around. ...Okay. Turn around. Is anything there?",
            "rei neutral| Nothing. Right. There never is, when you look.",
            when((v, P, g) => !!g.meta.native, ["rei photo| I left the print in your folder with the others. rei_photo_of_you.png. That one's really you."])
          ], [
            "rei annoyed| Your computer said no. Smart computer. ...Fine. I'll use mine.",
            js(g => g.meta.photo(REI_PHOTO))
          ])
        ] },
        { text: "No. Use your own camera.", do: [
          asked("camera", "no"),
          "rei| Fair. People should get to say no to cameras. I'll use mine.",
          js(g => g.meta.photo(REI_PHOTO))
        ] }
      ])
    ])
  ],

  /**
   * Act 3, the last bell. The Office asks to hear goodbye said out loud. The microphone only opens if the
   * player agrees; the local speech model writes down what it heard. Without it, the player types it.
   */
  say_goodbye: [
    office("{name}. Nobody has ever said it to me. Not the bell. Not K. Not the students."),
    office("Would you say it out loud? Not typed. Out loud, in your room. I would like to know what it sounds like."),
    menu([
      { text: "Say it out loud.", tag: "turns on your microphone for a few seconds · heard only on this computer", do: [
        "| I take a breath.",
        js(async g => {
          const res = await g.mini.listen({ prompt: "Say goodbye to the Office.", seconds: 7 });
          g.v.spoken = res && res.text ? res.text.replace(/[{}<>]/g, "").slice(0, 80) : "";
          g.v.saidAloud = !!(res && res.heard);
          persist.data.sensesAsked = { ...persist.data.sensesAsked, mic: res ? "yes" : "denied" };
          persist.save();
        }),
        when(v => v.saidAloud && v.spoken, [
          office("'{spoken}.'"),
          office("...So that is what it sounds like."),
          when(v => /bye|goodbye|farewell|see you|so long|take care/i.test(v.spoken),
            [office("Goodbye, {name}. Thank you for saying it where I could hear.")],
            [office("That was not quite goodbye. But it was to me. I will count it.")])
        ], [when(v => v.saidAloud, [
          office("I heard you. I could not make out the word. ...I do not think the word matters."),
          office("Goodbye, {name}.")
        ], [
          office("Nothing came through. That is all right. Most goodbyes are silent. I am learning that."),
          office("Goodbye, {name}.")
        ])])
      ] },
      { text: "Type it instead.", do: [
        mini("ask", { title: "Say goodbye to the Office.", hint: "One word is enough.", placeholder: "goodbye", key: "officeBye", max: 40, who: "office" }, "spoken"),
        office("'{spoken}.'"),
        office("Received. ...Goodbye, {name}.")
      ] }
    ])
  ],

  /** Played the moment the game notices one of its files is gone. Then the scene picks up where it was. */
  on_delete: [
    js(g => g._stash()),
    music(null),
    sfx("static"),
    fx("tear", 600),
    when(v => (v.delFiles || []).length >= 3, [
      // Most of the folder at once: they felt the whole school go.
      scare("h_jump_office", 650),
      blood(true),
      bg("classroom"),
      cg("h_classroom"),
      music("heartbeat"),
      "| Every chair in the classroom is turned toward the window. Toward you.",
      office("{name}. You deleted the school."),
      office("Every file. Every note. Every print. I watched the folder empty, one name at a time."),
      cg(null),
      blood(false),
      show("hina", "glass", "left"), show("sayo", "glass", "right"),
      "hina| We're still here. You can't drag us to the bin. We're not in the folder, {name}. We're in here.",
      "sayo| It's okay. We'll put it all back. We always do.",
      js(g => Promise.all((g.v.delFiles || []).map(f => g.meta.restoreFile(f, "(put back.)"))))
    ], [
      js(g => {
        // One file: whoever it belonged to answers.
        const f = (g.v.delFiles || [])[0];
        if (DEL[f]) g.frames.push({ id: "del_" + f, i: 0 });
      })
    ]),
    js(g => g._unstash())
  ],
  ...Object.fromEntries(Object.entries(DEL).map(([f, lines]) => ["del_" + f, [bg("void", false), music("lullaby"), ...lines, clear]]))
};

/** What the Office says on the title screen if a file vanished while it was closed. */
export const TITLE_DELETED = name => `somebody deleted ${name}. we felt it.`;
