# Design notes

Each decision below comes from a measurement of a reference site or from a reading or accessibility rule. The tokens live in `style.css`.

## References measured

| Site | Column | Body | Headings | Colours | Section gap |
|---|---|---|---|---|---|
| emilkowal.ski | 644px | 16px / 24–26px | 16px, weight 400; hierarchy by colour | Radix sand: `#21201c` text, `#63635e` secondary, `#fdfdfc` page | about 96px |
| paco.me | 640px | 16px / 28px | 16px / 500; section labels 14px secondary | `#e5e5e5` text, `#a0a0a0` secondary | 64–80px |

Both are one column, one type size, two text colours, no boxes or badges, and no accent colour. Rauno Freiberg's site was also studied and set aside: it is art-directed with horizontal scrolling, which suits a design portfolio but not a page a recruiter scans in thirty seconds.

## Decisions

**Column: 640px.** At 16px that is about 70 characters per line, inside the 45–75 range for comfortable reading, and it matches both references. On case studies, figures widen to 880px so screenshots stay legible. Diagrams are drawn at 1:1 so their 11.5px labels are never scaled down; they scroll sideways on narrow screens.

**Type: Inter only, three sizes, two weights.**
- Sizes: 14px for labels and metadata, 16px for everything you read, 24px for case-study titles only.
- Weights: 400 for text, 500 for names and titles. No bold.
- Tracking follows Inter's dynamic-metrics formula, −0.0223 + 0.185·e^(−0.1745·size): −0.006em at 14px, −0.011em at 16px, −0.019em at 24px.
- Line height is 1.75 (28px), as on paco.me.
- Numbers in dates and tables use tabular figures. Numbers stay with their units (non-breaking space), and compounds like "end-of-studies" use non-breaking hyphens.

**Colour: the Radix sand scale, no accent.**

| Use | Step | Light | Dark |
|---|---|---|---|
| Primary text | 12 | `#21201c`, 16.0:1 | `#eeeeec`, 16.3:1 |
| Secondary text | 11 | `#63635e`, 5.9:1 (AA) | `#b5b3ad`, 9.0:1 |
| Hairlines | 6 | `#dad9d6` | `#3b3a37` |
| Link underlines and chart bars | 8 | `#bcbbb5` | `#62605b` |
| Page | 1 | `#fdfdfc` | `#111110` |

Step 9 (3.3:1) is used only for decoration, never for text.

**Links.** Links inside sentences are underlined (1px, step 8, offset 3px) and turn to full colour on hover. Titles in lists are not underlined at rest, because a list of titles is plainly navigable; they underline on hover and on keyboard focus. External links carry ↗.

**Spacing: 4px base.** The steps are 8, 12, 16, 24, 32, 48, 64 and 96px.
- 96px above the page on desktop, 48px on mobile.
- 64px between sections.
- 48px between project cards.
- 24px between list items.
- 16px between a title and its text.

**Project media.** Every project image sits on the same neutral well (step 3, 12px radius). The image inside is inset so it keeps exactly 16:10: the padding of 5% and 8% of the width gives (W − 16%) / (W / 1.6 − 10%) = 1.6. Screens get a 6px radius and a hairline. The TrashGo phones float without a frame.

**Motion.** Colour and underline changes take 150ms; project images scale by 1.5% on hover over 400ms. The scaling is off for touch screens and for `prefers-reduced-motion`.

**Theme.** The page follows the system setting. The footer control cycles through system, light and dark, and stores the choice. A script in `<head>` applies the stored choice before first paint, so there is no flash.

**Accessibility.**
- Skip link.
- Visible 2px focus ring in the text colour.
- Every text colour pair passes WCAG AA.
- Decorative images use empty `alt` and are hidden from assistive technology when the title next to them already links to the same page.

**CV.** `cv.pdf` is printed from `cv.html` with the print stylesheet: A4, 9.5pt Inter, two pages, no page break inside a bullet or a paragraph.
