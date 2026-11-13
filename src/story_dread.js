/**
 * story_dread.js — 2.2 "The Mirror Update": the scenes behind the new effects in dread.js.
 *
 * Every scene here is reached from exactly one place: a call()/jump() in story.js, story_act3.js or
 * story_extra.js, a line's `skiptrap`, the Load screen's fake slots, or the title's Quit button.
 * Where it's placed is the point. Nothing here is chosen at random.
 */
import { persist } from "./persist.js?v=2.3.0";
import {
  bg, music, sfx, show, hide, clear, set, fx, menu, when, say, js, office, noskip, title, subliminal, without
} from "./script-helpers.js?v=2.3.0";

/** The slots the Office fills in after it wipes your saves (engine.js, openSaves). None of them are yours. */
export const FAKE_SAVES = [
  { who: "hina", thumb: "assets/sprites/hina/corrupt.webp", label: "Day 5 · 3:33 AM · saved while you were asleep" },
  { who: "rei", thumb: "assets/sprites/rei/corrupt.webp", label: "Day 412 · {clock} · a photo of you, saving" },
  { who: "sayo", thumb: "assets/sprites/sayo/corrupt.webp", label: "Day 0 · tomorrow · the door is open" },
  { who: "office", thumb: "assets/sprites/office/eye.webp", label: "Day ∞ · {date} · consolidated",
    // Desktop build only: if a well-known program is open (meta.otherApp), the Office's own save says so.
    labelApp: "Day ∞ · {date} · saved while {app} was open" },
  { who: "k", thumb: "assets/sprites/k/neutral.webp", label: "K · 412:13:09 · this one isn't K's either" },
  { who: "hina", thumb: "assets/sprites/hina/bleed.webp", label: "Day 1 · {playtime} ago · you said you'd stay" }
];

/** What's written in the lock file the player has to delete (Act 2, the infirmary door). */
export const LOCK_TEXT = `INFIRMARY DOOR — LOCKED BY THE OFFICE

student: Shiraishi Sayo
status: kept in
reason: drew too many doors

to unlock: delete this file.
(the Office cannot delete its own locks. it isn't allowed to throw anything away.)`;

/** Left in the folder (.exe) after the door opens. Nurse Mori's sign-in book. */
export const NURSE_BOOK = `HOSHIMI ACADEMY INFIRMARY — SIGN-IN

Mon  Shiraishi Sayo     headache
Tue  Shiraishi Sayo     headache
Wed  Shiraishi Sayo     can't remember
Thu  Shiraishi Sayo     can't remember
Fri  Shiraishi Sayo     (blank)
Mon  Shiraishi Sayo     headache
Tue  Shiraishi Sayo     headache
...
Thu  {name}             came to get her`;

const asked = (key, val) => js(() => { persist.data.sensesAsked = { ...persist.data.sensesAsked, [key]: val }; persist.save(); });
const as = (whoKey, text, expr) => js(g => g._say({ who: g.v[whoKey], expr, text }));

export const DREAD = {
  /* ---------- Act 2 opening: what they remember about how you played ---------- */

  /** Called from r_start. The exact words you said on the roof last week, how long you stared, when you ran. */
  d_memory2: [
    js(g => {
      // The Act 1 run that ended on the roof: whose route it was, and the last thing you said to her.
      const run = [...(persist.data.runLog || [])].reverse().find(r => r.ending === "rewind");
      if (!run || !run.route) return;
      g.v.histRoute = run.route;
      g.v.histPick = ([...run.choices].reverse().find(c => /like you|Fourteen|copy|This time/i.test(c)) || "").replace(/[.!?]+$/, "");
    }),
    when((v, P) => v.histRoute && v.histRoute !== P.erased && v.histPick, [
      js(g => g._show(g.v.histRoute, g.v.histRoute === "rei" ? "soft" : g.v.histRoute === "sayo" ? "sad" : "list_sad")),
      as("histRoute", "On the roof you said '{histpick}'. To me. I remember exactly how long you waited before you clicked it."),
      as("histRoute", "Then it rewound, and you pressed 'Again'. So I have to know: did you mean it the first time?"),
      when(v => v.histRoute !== "rei",
        [without("rei", "rei neutral| The roof door was open, by the way. The rest of us heard.")],
        [without("hina", "hina sad| The roof door was open, by the way. I heard. ...It's fine. It's fine!")])
    ]),
    when((v, P) => P.erased !== "rei" && P.stare && P.stare.ms > 15000, [
      "rei| You stared at one line for {staresecs} seconds last time. '{stareline}'",
      "rei| I was in that line. Holding still until you were done looking."
    ]),
    when((v, P) => P.erased !== "hina" && P.fearQuits > 0, [
      "hina worried| And you closed the game when it got scary, {fearquits}. The last time was right after '{fearline}'",
      "hina sad| We stayed in that moment until you came back. The whole time. That's what happens when you close it in the middle."
    ])
  ],

  /* ---------- the skip trap (Act 2 Wednesday, roll call) ---------- */

  /** You skipped Kanda-sensei's roll call. She noticed. So did the thing at the window you just missed. */
  d_skip_roll: [
    noskip(true),
    fx("flicker", 200),
    "sensei| Stop.",
    "| Kanda-sensei is looking straight at me. Not at the transfer student. At me.",
    "sensei| You skipped me. You skip me every week. Do you know what that's like? Saying the same thing to someone who's holding a button down?",
    "sensei| I say it every morning because it's all I'm allowed to say. You could at least let me finish.",
    "sensei| ...You missed him too, you know. At the window. He's always at the window during roll call. You'd have seen him if you'd been listening.",
    "| Then she blinks, and she's tired again, and she goes back to the register like nothing happened.",
    noskip(false)
  ],

  /* ---------- back after the crash (Act 2 Thursday) ---------- */

  d_after_crash: [
    fx("glitch", 400),
    without("hina", "hina sad| ...You're back. It threw you out. Did it hurt?", "rei soft| You're back. Are you okay?"),
    without("rei", "rei| Everything went black for {crashago}. Not dark. Black. Like the inside of a lens cap.",
      "hina| It went black for {crashago}. I counted so I wouldn't have to think about it."),
    without("rei", "rei annoyed| You pressed 'Close'. It let you, this time. Then it opened the door again right behind you."),
    without("hina", "hina worried| We were in the middle of a sentence. We stayed in it the whole time you were gone.")
  ],

  /* ---------- the hallway (Act 2 Thursday): hidden timer, panic, decoupled dialogue ---------- */

  /** Called from r_find, before the infirmary. */
  d_hall: [
    js(g => { g.dread.darkness(true); g.dread.rumble(true, 96); }),
    "| The lights in the corridor go out, one by one, from the far end toward us.",
    without("hina", "hina worried| {name}. There's something at the other end of the hall.", "rei shocked| {name}. Something moved at the other end."),
    without("rei", "rei| Don't point at it. Don't even move the cursor at it. Just decide.",
      "hina worried| Don't move the cursor towards it. I think it'll see."),
    menu([
      { text: "Hide in the supply closet.", do: [
        without("hina", "| We cram into the closet. Hina's hand is over her own mouth. Something walks past the slats, very slowly, at exactly the height of a person sitting down.",
          "| Rei pulls me into the closet. Something walks past the slats, very slowly, at exactly the height of a person sitting down.")
      ] },
      { text: "Run for the infirmary.", do: [
        "| We run."
      ] },
      { text: "Call out for Sayo.", if: (v, P) => P.erased !== "sayo", do: [
        "me| SAYO!",
        "| It turns toward the sound."
      ] }
    ], { timeout: 6500, hidden: true, timeoutDo: [
      // You took too long. Your legs decided for you.
      fx("shake", 400),
      "| I took too long. My legs decide for me. I'm already running before I know I am.",
      without("hina", "hina| {name}, WAIT", "rei| {name}, WAIT")
    ] }),
    js(g => { g.dread.panic(true); g.dread.decouple(true, 850); }),
    sfx("thud"),
    "| Footsteps behind us. Not running. Walking. It doesn't have to run.",
    without("hina", "hina| go go go go go go"),
    without("rei", "rei| don't look back don't look back don't"),
    "| The words keep going without me. I can't stop to read them. The hallway is longer than it was. It's longer than it's ever been.",
    without("sayo", "sayo| this way. this way. this way. this way.", "rei| there. the white door. there."),
    "| A door. A white door, at the end of everything.",
    js(g => { g.dread.decouple(false); g.dread.panic(false); g.dread.darkness(false); g.dread.rumble(false); })
  ],

  /** The infirmary door is locked, and the lock is a file. */
  d_lock: [
    "| It's locked. From the inside. There's no keyhole on this side.",
    without("rei", "rei| There's no lock on this door. I mean there's no lock in the game. It's somewhere else.",
      "hina| I can't see a lock. Could it be somewhere on your side?"),
    without("sayo", "sayo| (through the door) it's not in here. it's in your folder. the lock is a file. i can't touch files.",
      "rei| Check your folder. If it can lock a door that doesn't have a keyhole, it can do it with a file."),
    without("sayo", "sayo| you can."),
    js(async g => {
      const text = persist.data.erased === "sayo"
        ? "INFIRMARY RECORDS — LOCKED BY THE OFFICE\n\nTo open the infirmary: delete this file."
        : LOCK_TEXT;
      g.v.lock = await g.dread.folderPuzzle({ file: "infirmary_door.lock", text });
    }),
    when(v => v.lock === "cant", [
      without("sayo", "sayo| It's okay. I'll do it the slow way, from in here. ...There.",
        "hina| The frame's loose. Rei, pull when I count to three."),
      without("sayo", "| The lock clicks. It took a long time. Long enough that I heard her crying a little on the other side.",
        "| On three the door comes away from the frame. Nobody's holding it shut on the other side.")
    ], [
      without("sayo", "| The lock clicks open on its own. On the other side, someone breathes out.",
        "| The lock clicks open. A corner of paper stirs in the draft."),
      when((v, P, g) => !!g.meta.native, [without("rei", "rei| You deleted it. From out there. ...Your hands are allowed to do things ours aren't.",
        "hina| You deleted it. From out there. I can't even touch the files.")])
    ]),
    js(g => g.meta.writeFile("nurse_sign_in.txt", persist.data.erased === "sayo"
      ? NURSE_BOOK.replace("came to get her", "looking for her")
      : NURSE_BOOK))
  ],

  /** Holding your breath while it goes past. Microphone only if the player says yes. */
  d_hush: [
    without("sayo", "sayo scared| Shh. It's still in the hallway. It followed you here. It hunts by sound.",
      "rei shocked| Shh. It followed us. I think it hunts by sound."),
    when((v, P) => !navigator.mediaDevices || P.sensesAsked.hush === "no", [
      js(async g => { g.v.hush = await g.dread.hush({ seconds: 10 }); })
    ], [
      menu([
        { text: "Listen for it.", tag: "turns on your microphone for 12 seconds · heard only on this computer · nothing is saved", do: [
          asked("hush", "yes"),
          js(async g => { g.v.hush = await g.dread.hush({ seconds: 12, mic: true }); })
        ] },
        { text: "Just hold still.", do: [
          asked("hush", "no"),
          js(async g => { g.v.hush = await g.dread.hush({ seconds: 10 }); })
        ] }
      ])
    ]),
    when(v => v.hush && v.hush.heard, [
      "| Something in the hall stops.",
      fx("achievement", "Found — made a sound", "threat"),
      without("sayo", "sayo| It heard you. ...It's okay. It only wanted to know where you are. It knows now.",
        "rei| It heard that. Wait. Let it pass.")
    ], [
      "| Whatever it is goes past the door. It takes a long, long time."
    ]),
    when(v => v.hush && v.hush.silent && v.hush.mic, [without("sayo", "sayo| You went so quiet. I couldn't hear you breathing at all. Don't do that to me.",
      "rei| I couldn't hear you breathing at all. Breathe now. I think it's gone.")]),
    "| Then, from down the hall, something answers.",
    js(async g => {
      g.v.echoed = await g.dread.playEcho(persist.data.erased === "hina" ? "rei" : "hina", "{name}... it's me... come back to the classroom...");
    }),
    when(v => v.echoed, [
      "| It's my voice. Backwards, and slow, and wrong. It's been listening.",
      without("rei", "rei| That's you. It's doing you now. It learned you in twelve seconds.",
        "hina worried| That's your voice. It learned you in twelve seconds.")
    ], [
      without("hina", "| It's Hina's voice. Hina is standing right next to me with her mouth shut.",
        "| It's Rei's voice. Rei is standing right next to me with her mouth shut."),
      without("hina", "hina worried| That's not me. I'm here. That's not me, that's not me.",
        "rei shocked| I'm right here. Don't answer it.")
    ]),
    js(g => g.dread.rumble(false))
  ],

  /* ---------- the Office loses its temper (Act 2 Friday) ---------- */

  d_entrap: [
    music(null),
    office("No."),
    js(g => { g.dread.entrap(); }),
    "| The window shrinks. It throws itself into a corner of the screen, then the other corner, like something in a jar.",
    without("rei", "rei shocked| It's trying to get out. Not us. It. It wants out of the game and onto your desktop, where you can't close it.",
      "hina worried| I think it wants to get out. Onto your desktop, where you can't close it."),
    without("sayo", "sayo| It can't. It's only a window. Let it rattle.", "rei| Let it rattle. It can't get through the glass."),
    music("evening")
  ],

  /* ---------- the Office's saves (Load screen, after the wipe) ---------- */

  d_fake_save: [
    js(g => { g.v.fakeIdx = g._fakeIdx || 0; g.v.fakeMid = g.frames.length > 1; if (g.v.fakeMid) g._stash(); g.showUI(true); }),
    bg("void", false),
    music("drone"),
    fx("static", 500),
    when((v, P) => v.fakeIdx === 0 && P.erased !== "hina", [show("hina", "corrupt", "center"),
      "hina| That's not a save. That's me at 3:33, watching you sleep with the game still open.",
      "hina| I saved it so I'd have proof you stayed."]),
    when((v, P) => v.fakeIdx === 1 && P.erased !== "rei", [show("rei", "corrupt", "center"),
      "rei| I took that one from behind you. You were clicking 'Save'. You looked so serious.",
      "rei| It's the only photo I have where you don't know I'm there."]),
    when((v, P) => v.fakeIdx === 2 && P.erased !== "sayo", [show("sayo", "corrupt", "center"),
      "sayo| Day zero. That's the day before the week starts. Nobody's ever been there.",
      "sayo| The door's open in it. You can't load it. I just wanted you to see that it exists."]),
    when((v, P) => v.fakeIdx === 3 || FAKE_SAVES[v.fakeIdx]?.who === P.erased, [show("office", "eye", "farright"),
      office("This save contains every save. You do not need to open it. It is already open."),
      office("You are in it now."),
      when((v, P, g) => g.meta.otherApp, [
        office("You also have {app} open. That is all right. It has been noted in the save."),
        office("We do not mind sharing you, {name}. We only like to know with what.")])]),
    when(v => v.fakeIdx === 4, [show("k", "neutral", "center"),
      say("k", null, "it's not mine. i never saved on day 412. i never got that far. somebody keeps making them in my name.", { speed: 18 })]),
    when((v, P) => v.fakeIdx === 5 && P.erased !== "hina", [show("hina", "bleed", "center"),
      say("hina", "bleed", "You said you'd stay. It's in the save. I can play it for you. I can play it for you forever.", { corrupt: true })]),
    clear,
    when(v => v.fakeMid, [js(g => g._unstash())], [title])
  ],

  /* ---------- the menu you can't quit (title, after the first ending) ---------- */

  d_quit_menu: [
    bg("void", false),
    fx("mood", "red"),
    music("drone"),
    js(g => { g.v.qw = persist.data.erased === "sayo" ? "hina" : "sayo"; g._show(g.v.qw, "glass", "center"); }),
    "| The menu comes back wrong. The buttons are there, but the words on them have run, and nobody is standing on their marks. One of them is standing much closer.",
    as("qw", "You pressed Quit twice. ...I know. I'm not going to stop you."),
    as("qw", "Just don't leave the way K did. Say it first. Then you can go."),
    menu([
      { text: "Goodbye.", do: [
        as("qw", "...Goodbye, {name}. Come back when you want to. Not when it wants you to.", "sad"),
        js(g => { g._quitOk = true; g.frames = []; g.showUI(false); g._clearSprites(); g.meta.mood(null); g._quit(); })
      ] },
      { text: "Stay a little longer.", do: [
        as("qw", "Okay. ...Okay. I'll go back to my mark.", "neutral"),
        title
      ] }
    ])
  ],

  /* ---------- Act 3 Tuesday: inspecting the player ---------- */

  d_inspect2: [
    office("Inspection, part two. The player."),
    office("Please confirm that you can see the students from every angle."),
    js(g => g.dread.flip(true)),
    sfx("thud"),
    "rei shocked| It flipped the — the whole room is upside down. Sayo, hold on to something.",
    "sayo| I'm fine. I'm drawn from above anyway.",
    "hina worried| {name}, look in Settings. It says it did it. It signed its name on it.",
    js(g => g.dread.flip(false)),
    office("Viewing angle confirmed. Now, the hands."),
    js(g => g.dread.invert(true)),
    "| My cursor jumps to the other side of the screen. When I move right, it goes left.",
    "rei| Use the number keys if you have to. It forgets the keyboard exists.",
    office("Select the option that keeps you here."),
    menu([
      { text: "I'm here because they're here.", do: ["sayo| ...It made you work for that one. Thank you."] },
      { text: "I'm here because you made more of everything.", do: [office("Correct.")] },
      { text: "Give me my mouse back.", do: [js(g => { g.v.defy = (g.v.defy || 0) + 1; }), office("...Returned. This time.")] }
    ]),
    js(g => g.dread.invert(false))
  ],

  /* ---------- Act 3 Monday: the choices that got you the good ending ---------- */

  d_history3: [
    js(g => {
      const run = [...(persist.data.runLog || [])].reverse().find(r => r.ending === "summer");
      if (!run) return;
      const picks = [...new Set(run.choices.filter(c => c.length < 60))].slice(-4);
      g.v.histPickList = picks;
      g.v.histPicks = picks.map(c => `'${c}'`).join(" ");
    }),
    when(v => v.histPickList && v.histPickList.length >= 2, [
      office("I have reviewed how you reached the good ending last term, {name}."),
      office("{histpicks}"),
      office("Those were your choices. In that order. They worked once."),
      "sayo blank| It's going to give you the same choices. And then make them not work.",
      office("Choose."),
      js(g => g._menu({ items: [
        ...g.v.histPickList.map(text => ({ text })),
        { text: "Something new.", crossed: "the Office: not on record", crossedSay: "Only choices on record are available." }
      ] })),
      office("You chose '{lastChoice}' again. You are very easy to keep, {name}."),
      "hina| Don't listen. Picking the same thing twice isn't being easy. It's meaning it."
    ])
  ]
};
