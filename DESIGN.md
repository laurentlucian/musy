# Musy UI

Use Grok’s warm dark palette and compact typography. No editorial styling, serif headlines, or decorative copy.

Keep the labeled desktop sidebar and mobile navbar. Listening includes overview, top music, and history. Collection includes liked songs and playlists. Shared queues and settings have dedicated destinations. Details retain navigation.

Preserve existing music data and mutations. Keep action labels truthful, errors visible, and keyboard focus clear.

## Theme tokens

Source: live computed styles on https://grok.com, September 4, 2026 (warm dark theme).

| Role | Grok value | Musy token |
| --- | --- | --- |
| Page / sidebar | `hsl(30 5% 7%)` / #131211 | background / sidebar |
| Cards / inputs | `hsl(30 5% 9%)` | card / input-background |
| Muted surface | `hsl(30 5% 12%)` | muted |
| Menus / toasts | #23211f | popover |
| Primary text | `hsl(0 0% 99%)` | foreground |
| Secondary text | `hsl(0 0% 62%)` | muted-foreground |
| Dividers / dialog borders | `hsl(0 0% 99% / 6%)` | border |
| Filled button / hover / pressed | `oklch(99.24% 0 none)` / `oklch(90.01% 0 none)` / `oklch(69.96% 0 none)` | button-filled / button-filled-hover / button-filled-active |
| Secondary fill / hover / pressed | off-white at 8% / 10% / 12% | secondary / button-secondary-hover / button-secondary-active |
| Outline button border | `oklch(90.01% 0 none / 8%)` | button-outline-border |
| Danger text | `hsl(357 82% 71%)` | destructive |
| Modal overlay | `oklch(11.57% 0 none / 50%)`, 2px blur | overlay |

Dialogs use the page surface, a 24px radius, and no shadow. Menus use the raised popover surface. Buttons are pills; sidebar selections use a translucent fill, with primary text. Focus uses Grok’s blue accent (`hsl(207 100% 58%)`) for visibility. Keep raw semantic values as HSL channels for existing consumers; exact OKLCH interaction colors are separate tokens. Preserve music artwork and data visualization colors.
