# Reel — The asking price is never the price

Week 1 flagship reel, built from the Notion brief. This folder contains a
**finished, generated video** plus the code that produces it.

## The deliverable

- **`asking-price-is-never-the-price.mp4`** — a ~30s, 1080×1920 (9:16) reel with
  sound, ready to upload to Instagram. H.264 / AAC.

The five scenes in the brief describe the *background footage*, so each is
rendered as an animated scene:

| # | Scene (background) | On-screen text |
|---|--------------------|----------------|
| 1 | Terracotta rooftops, golden hour, slow pan | "The asking price is never the price." |
| 2 | Warm stone wall, raking light | `seconda casa` — **9%** transfer tax, not two |
| 3 | Cypress on a ridge, light on the Arno | (footage only) |
| 4 | The view again, sun lower | "We say so before you fall in love. Not after." |
| 5 | Cypress-green close | CTA: "Save this before you start looking." |

The voiceover lines run as burned-in captions for sound-off viewing, and an
original ambient score plays underneath. Type is set in the Kämpe Estates fonts
(Cormorant Garamond + Inter); the accent is the brief's cypress green `#36463B`.

Note: the backgrounds are **stylized, animated motion graphics**, not real
Tuscany footage. This environment has no access to stock or generated video, so
the scenes are drawn procedurally. They read as illustrative/branded, not as
photographic listings, which keeps the brand's trust rule intact. To swap in real
footage later, use the interactive template below.

## How it's generated (reproducible)

Everything runs locally, no external services:

1. `generate/renderer.html` — a 1080×1920 canvas that animates the five scenes,
   draws the on-screen text in the brand fonts, and plays a Web Audio score. It
   records itself (canvas + audio) via `MediaRecorder` to WebM (VP9/Opus).
2. `generate/render.cjs` — drives the renderer in Chromium and saves the WebM.
3. WebM is transcoded to Instagram-ready MP4 (H.264/AAC) with `ffmpeg.wasm`.

```
node generate/render.cjs out.webm      # render scenes + score
# then transcode out.webm -> .mp4 (ffmpeg.wasm, H.264/AAC)
```

## Optional: drop in your own footage

`asking-price-is-never-the-price.html` is an interactive, footage-led template:
each scene is a full-bleed video slot. Create a `clips/` folder beside it and add
`scene-1.mp4` … `scene-5.mp4` to replace the animated backgrounds with real
clips, then screen-record it or re-render. Shot map and VO script are below.

## Voiceover script

1. You see the view. The light, the stone, four hundred years of it.
2. Here is the part no one shows you. On a second home, the transfer tax alone is nine percent. Not two.
3. Add the notary, the surveyor, the survey, the agency. Total acquisition cost runs ten to fifteen percent above asking. Every time.
4. We represent the buyer only. For those who would rather know than hope.
