# After Class — itch.io release kit

Everything needed to put After Class on itch.io as a paid game. Fill in the fields in this order on **itch.io → Dashboard → Create new project**.

## Files in this folder
| File | Where it goes |
|---|---|
| `AfterClass-windows.zip` | **Uploads**: tick "Executable → Windows". It's built by `npm run dist` and then zipped, and it isn't committed to git. |
| `cover-630x500.png` | **Cover image** |
| `banner-960x300.png` | Optional. Use it as the page banner under "Edit theme" |
| `screenshots/01–08.png` | **Screenshots**, in this order. All are 1920×1080 |

## Project fields
- **Title:** After Class
- **Project URL:** `after-class`
- **Short description / tagline:** A dating sim about the last week before summer. Summer never comes.
- **Classification:** Games
- **Kind of project:** Downloadable
- **Release status:** Released
- **Pricing:** Paid. A suggested price is **$4.99 USD**, with "Allow buyers to pay more" ticked. Short, 1–2 hour meta-horror visual novels usually sell for $3–$7.
- **Genre:** Visual Novel
- **Tags** (itch allows up to 10): `horror`, `psychological-horror`, `visual-novel`, `dating-sim`, `anime`, `meta`, `fourth-wall`, `multiple-endings`, `short`, `singleplayer`
- **AI generation disclosure:** **Yes**, for **Graphics**. The character sprites and backgrounds were made with AI image generation. itch.io requires this disclosure, and it adds an "AI Generated" tag automatically. The writing, code and procedurally generated music are not AI-generated assets.
- **Custom noun:** leave blank
- **Community:** Comments
- **Visibility:** Draft first. Switch to Public once payments are set up and you've checked the page.

## Description (paste into the description box)

> **Hoshimi Academy. The last week of term. Five days until summer break.**
>
> You're the transfer student nobody had time to befriend. Then, in the last week before summer, three girls decide you're worth knowing:
>
> - **Hina**, the sunny class rep, who has a summer list and wants you on it.
> - **Rei**, the sarcastic photography club (she *is* the club), who keeps finding someone standing behind you in her photos.
> - **Sayo**, the quiet girl from the infirmary, who draws a little box at the bottom of every picture, with words inside it.
>
> Spend each afternoon with whoever you like. Walk home along the river. Develop film in the darkroom. Sit by the infirmary window.
>
> The school's PA system will remind you, every afternoon, that summer is almost here.
>
> *It will keep reminding you.*
>
> ---
>
> **After Class** is a short psychological horror visual novel disguised as a dating sim. It knows it's a game, and it knows you're playing it.
>
> - Three girls, two very different playthroughs, and three endings.
> - A story that changes once you've finished it once.
> - An original soundtrack that's generated live while you play, and a PA system with a voice of its own.
> - Things in the game folder that weren't there when you started.
>
> Play it once. Then play it again.
>
> **Estimated playtime:** about 1–2 hours to see every ending.

## Content warnings (paste under the description, and tick "Contains flashing lights" if offered)
> ⚠ **Content warning.** After Class is a psychological horror game. It contains flashing lights, screen shake and glitch effects, sudden loud sounds, and fourth-wall-breaking moments that refer to you and your computer. The game creates text and image files only inside its own "Hoshimi Academy" folder next to the .exe. It never reads, changes or deletes anything else. Not suitable for children.

## System requirements (paste at the bottom)
> - Windows 10 or 11 (64-bit)
> - About 300 MB of free disk space
> - Speakers or headphones recommended
>
> The game is a single portable .exe with nothing to install. Windows SmartScreen may warn you the first time you run it because the game isn't code-signed. Click **More info → Run anyway**.

## Credits (paste at the bottom)
> Written and designed by Bryan Lee.
> Character art and backgrounds created with AI image generation, then edited for the game.
> Music and sound are generated in real time by the game.

## Uploading with butler (optional, faster updates)
itch's command-line uploader lets you push new versions without using the website.

1. Install butler from https://itch.io/docs/butler/
2. Log in once. It opens your browser so you can approve it there:
   ```bash
   butler login
   ```
3. Push the build. Replace `YOUR-USERNAME` with your itch username:
   ```bash
   butler push itch/AfterClass-windows.zip YOUR-USERNAME/after-class:windows
   ```

## Before you set it to Public
- [ ] **Payments:** itch.io → Settings → *Payment settings*. Choose how you get paid (PayPal or direct deposit) and complete the **tax interview**. Paid games can't be bought until this is done.
- [ ] **The free web version:** the full game is currently free at codingguardsman.github.io/DatingSimAlex. Decide whether to take it down, or keep it as a free demo.
- [ ] Play through the downloaded zip once on a clean machine, or at least from a fresh folder.
- [ ] Check the page on mobile using itch's preview.
