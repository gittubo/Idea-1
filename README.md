# VESTIGE

**A museum of human experience.** *Everything leaves something behind.*

VESTIGE is a digital museum that visitors move through rather than navigate. Architecture establishes a
sense of place, artworks are the primary attraction, and camera movement is the storyteller: in each work
the camera travels while the artwork stays perfectly still.

This repository is the **first release vertical slice** from the production blueprint: one cinematic
entrance, one grand hall, one explorable gallery, one guided exhibition (*What Remains*), one original
featured artwork (*The Last Witness*) with a complete scroll-controlled film, its interpretation record,
and a working collection archive.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm test             # unit tests: camera maths, content records, return-path safety
npm run build
npm run e2e          # acceptance checklist against the production build (needs Playwright's Chromium)
```

## The museum, screen by screen

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | 01 Cinematic entrance → 02 Grand hall | A line of light, a door parting, the wordmark. *Skip intro* is available from the first frame; sound stays off until asked for. Afterwards the hall offers three destinations. |
| `/explore` | 03 Free exploration | A CSS 3D gallery. Point-to-point movement: choose a destination, the camera travels. Choosing the artwork approaches it before the film begins; leaving the film retreats back into the room. |
| `/journey/what-remains` | 04 Guided exhibition | The four chapters (*The Mark, The Feeling, The Fall, The Echo*) as one directed route, with a quiet chapter indicator. Chapters II–IV are announced as in preparation. |
| `/artwork/the-last-witness` | 05 Artwork film + 06 Interpretation | Scrolling drives the camera through five shots: forward explores, stopping holds, back retraces. *About this work* opens the record. Escape closes the record, then exits to wherever the visitor came from. |
| `/collection` | 07 Collection archive | Search and filters. Every work is reachable without entering the virtual museum. |
| `/about` | | Philosophy, how records are written, and credits. |

**Reduced motion** (system setting or the Museum menu) replaces the pinned film with the same five shots
as still framings, and the intro with its final frame.

## How it's built

- **Next.js + TypeScript**, statically generated. No CMS yet: content lives in typed records in `data/`
  whose shapes (`Artwork`, `Exhibition`, `Gallery`, `ArtworkSequence`) are the contract a headless CMS
  will fill later.
- **Hybrid rendering, as decided**: CSS 3D for architecture (`components/Room.tsx`), HTML/CSS for frames
  and interface. No WebGL yet; it is reserved for spaces where real depth matters.
- **Deterministic camera** for the artwork film (`engine/camera-controller.ts`). The film is not a
  video: it moves a camera over the approved master image using keyframes in the artwork record. This
  guarantees the artwork is never altered, makes every scroll position map to exactly one frame, and
  avoids the scroll-seeking problems video has on iPhone Safari. Zoom interpolates geometrically, each
  framing eases in and out so the camera settles before moving on, and the image always covers the
  viewport. A high-density **detail tile** over the subject keeps the extreme close-ups sharp.
  `ArtworkSequence.method: "video"` is reserved for works whose film is produced as AI or rendered video.
- **Experience controller** (`engine/experience-controller.tsx`) holds the museum state from the
  blueprint (`mode`, current gallery, artwork and exhibition, sound, reduced motion).
- **Sound** is synthesised (`engine/media-controller.ts`): a low tonal signature over room tone. It
  starts only from a visitor's gesture and dips while a work is in focus.

```
app/          routes (one per screen)
components/   Room, Entrance, GalleryRoom, ScrollFilm, ArtworkExperience, Interpretation, …
engine/       camera, scroll, sound, navigation, state
data/         content model and records
tools/        the placeholder master's source and the script that renders its delivery files
tests/        unit tests and the acceptance run
```

## The Last Witness — placeholder master

The approved master artwork does not exist yet. The blueprint's next production milestone is to create
and approve it before the camera sequence is finalised. Until then the film runs over a **procedural
placeholder study** (`tools/the-last-witness.svg`), and the site says so in the record and on the film's
closing card (`isPlaceholderMaster: true`).

To swap in the real master:

1. Replace `public/artworks/the-last-witness/master.jpg` (4096 px on the long edge) and `mobile.jpg`
   (2048 px), and render or crop a `detail.jpg` over the region the close-ups visit.
2. Update `media` in `data/artworks.ts`, including `detail.region`, in master-image pixels.
3. **Re-frame the keyframes** on the new composition. Every movement should reveal something.
4. Set `isPlaceholderMaster: false`.

To change the placeholder itself, edit the SVG and run `npm run render:master`.

## Acceptance checklist

`npm run e2e` runs the blueprint's definition of done on desktop (1440×900) and mobile (390×844):
skippable intro; entrance; entering and exploring the gallery; an approach rather than a cut into the
artwork; scroll advances, held scroll holds the frame, and reverse scroll retraces it; the artwork image
is unaltered; exit returns to the previous gallery; context and credits are accessible; reduced motion
works; plus the journey, the collection, and a check that a crafted `?from=` cannot redirect off-site.
It does not test on a real iPhone. Test Safari on a device before expanding the collection.

## Not built yet

The impossible-corridor transition (Scene 03 of the homepage), chapters II–IV and their works, the
headless CMS, selective Three.js for sculptural hero objects, a video-based film pipeline, and checks of
VESTIGE's name and trademark availability.
