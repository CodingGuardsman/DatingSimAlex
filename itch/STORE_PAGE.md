# After Class — itch.io release kit

Everything needed to put After Class on itch.io as a paid game. Fill in the fields in this order on **itch.io → Dashboard → Create new project**.

## Files in this folder
| File | Where it goes |
|---|---|
| `AfterClass-windows.zip` | **Uploads**: tick "Executable → Windows". It's built by `npm run dist` and then zipped, and it isn't committed to git. |
| `cover-630x500.png` | **Cover image**. Look for the person standing in the sea. Regenerate both images with `python itch/make_cover.py .` |
| `banner-960x300.png` | Page banner under "Edit theme". Someone is standing at the end of the pier |
| `screenshots/01–08.png` | **Screenshots**, in this order. All are 1920×1080, in the cute UI: title, Hina, Rei, sparklers, the group chat, Sayo, the scrapbook, and one slightly off line from Rei. Recapture them with `itch/capture_shots.mjs` |
| `trailer.mp4` | **Trailer**, 52 s, 1080p. Uploaded (Unlisted) at https://youtu.be/Bs_nh6antLc and set as "Gameplay video or trailer". Rebuild it with `itch/make_trailer.py` |

## Project fields
- **Title:** After Class
- **Project URL:** `after-class`
- **Short description / tagline:** Five days until summer ♡ A sweet school romance.
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

## Page theme (Edit theme)
Pastel, so the page looks like an ordinary romance.
- Background `#ffe6f0`, inner background `#fffafc`, text `#5b3d4c`, links `#e2487f`
- Header text `#ff6fa3`, buttons `#ff78aa`
- Font: Nunito (body and headers)
- Banner: `banner-960x300.png`, centered

## Description (paste into the description box)
The page is meant to look like an ordinary, sweet dating sim. The unease comes from small details, never from the word "horror". The honest content warning stays at the bottom, the way other games in this genre do it.

> ♡ **Summer break is only five days away!** ♡
>
> You've just transferred to Hoshimi Academy for the very last week of term. You don't know anyone yet, but that's about to change. Three lovely girls can't wait to get to know you:
>
> - 🌻 **Hina**, the cheerful class rep. She's writing a list of everything she wants to do this summer, and there's room on it for you!
> - 📷 **Rei**, the photography club's one and only member. She says you're very photogenic. She takes a lot of pictures of you.
> - 📓 **Sayo**, the quiet girl who spends her afternoons in the infirmary. She loves to draw. She's been drawing you for a while.
>
> Spend each afternoon with whoever you like! Walk home along the river, develop film in the darkroom, or sit by the infirmary window and watch the clouds go by.
>
> **Features**
> - Three sweet girls to get to know
> - Five whole afternoons together, and multiple endings
> - Cozy music that's made just for you, while you play
> - A friendly school announcement every afternoon, so you never lose track of the days
>
> Summer is only five days away.
>
> See you after class! ♡
>
> 🌸 **Free demo:** play the first week in your browser at https://codingguardsman.github.io/DatingSimAlex/
>
> Estimated playtime: about 1–2 hours.
>
> ---
>
> *This game is not suitable for children or those who are easily disturbed. It contains flashing lights, screen shake, sudden loud sounds and scenes some players may find upsetting. The game keeps a few files in a "Hoshimi Academy" folder next to the .exe. It never reads, changes or deletes anything else.*

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
3. Push the build. Your itch username is `stagworks`:
   ```bash
   butler push itch/AfterClass-windows.zip stagworks/after-class:windows
   ```

## Before you set it to Public
- [ ] **Payments:** itch.io → Settings → *Payment settings*. Choose how you get paid (PayPal or direct deposit) and complete the **tax interview**. Paid games can't be bought until this is done.
- [x] **Link the free demo to the store:** done. `STORE_URL` in `src/config.js` points to https://stagworks.itch.io/after-class, so the demo's last screen shows a "Get the full game on itch.io" button.
- [ ] Play through the downloaded zip once on a clean machine, or at least from a fresh folder.
- [ ] Check the page on mobile using itch's preview.
