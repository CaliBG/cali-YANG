# UNT × YZS / 留白发生

Portfolio route: `/unt-yzs/`. The homepage features the project after Tongkuang and Vanod.

## Presentation

- Inherit the portfolio shell, theme, navigation and language settings.
- Use existing final artwork, complete films and photographs individually. Do not generate collages or recreate the imagery.
- `BalloonScene` is a transparent image layer driven by the existing scroll container. Scrolling in reverse reverses its movement. A static toggle and reduced-motion support are included.
- `CampaignOverview` brings three complete late-stage artworks into a single responsive board. Desktop scroll gathers independent cards into place; a static toggle and reduced-motion/mobile layouts show the full overview immediately. Each original opens in a native dialog.
- The latest complete film plays on request, pauses offscreen or when the document is hidden, and does not compete with the site's background audio. The earlier 720p export of the same film and its unused cover were removed from public assets.
- Source files remain unchanged. Public WebP and H.264 copies are optimized for web delivery.

## Asset provenance

Original paths below are relative to the user's `咖啡联名` project directory.

| Web asset | Existing source |
| --- | --- |
| `balloons-transparent.webp` | `02_产品与气球素材/02_气球实拍与组合/联名白气球牵咖啡_黑底.png`; remove the black background and trim transparent padding, preserving the balloons, print, strings and cup |
| `sold-out.webp` | `断供应海报.png` |
| `final-poster.webp` | `03_海报与Banner/01_竖版海报/03_白底线条海报源文件/留白发生_线条气球与咖啡_原版.png` |
| `banner-02.webp` | `03_海报与Banner/02_横版Banner/01_白底四款_720x240_交付/高清备份_2160x720/02_白气球相遇_2160x720.png` |
| `collaboration-film.mp4` | `微信视频2026-11-03_154356_827.mp4`; complete 70.548-second film, 1080 × 1920, 30 fps H.264/AAC |
| `film-cover.webp` | Still frame from the retained collaboration film |
| `photo-cafe.webp` | `咖啡反馈照片/返图/ddc0f5de2e70804fcbe29c4476df09.JPG` |
| `photo-making.webp` | `咖啡反馈照片/返图/1a104e469f538152b525a3571552c6.JPG` |
| `photo-window.webp` | `咖啡反馈照片/返图/5ed7b2f0bd3f7a5df6f7a35758912b.JPG` |
| `photo-takeaway.webp` | `咖啡反馈照片/返图/644.JPG` |
| `photo-table.webp` | `咖啡反馈照片/返图/IMG_8279.jpg` |

## Verification — 2026-11-03

- Production static export and TypeScript checks pass.
- Desktop 1440 × 900 and mobile 390 × 844 inspected; no horizontal overflow.
- Transparent stage, reversible scroll progress, original-image dialog, film selection and photo navigation checked in the browser.
- The retained 1080 × 1920 film has its complete 70.548-second duration; the former 720p film was a near-duplicate export, not a separate project film.
- All project assets are below the hosting limit of 25 MiB per file.

## Approved community feedback — 2026-11-03

- `feedback/01.webp` through `feedback/20.webp` come exclusively from the reviewed `咖啡反馈照片/已处理` directory: 19 Moments excerpts and one small coffee-photo crop, not 20 distinct customers.
- Lossless WebP preserves every decoded pixel of the approved PNGs. Names, avatars and names within comments are already obscured in the source pixels; public files contain no original/private version or source metadata.
- `FeedbackStack` displays complete screenshots, with reversible card navigation, horizontal swipe, a native selection menu and an expanded reader. Tall screenshots scroll naturally; the 237px photo stays at its original size.
- Keyboard arrows, last-to-first wrap, Escape dismissal and trigger-focus restoration checked. Mobile 390 × 844 layout has no horizontal overflow.
- No regenerated imagery or raster collage is used in either the overview or the feedback section.
