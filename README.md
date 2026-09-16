<img width="1915" height="366" alt="srcnsht-png-16-26" src="https://github.com/user-attachments/assets/251e1fc8-0919-44b1-a7db-2f0088a6e083" />

# Axiozontal

A Discord theme that moves the server list into a horizontal bar across the top (or bottom) of the window.

Written from scratch. Unlike the older HorizontalServerList approach, it does not rotate the sidebar by 90 degrees. Discord's app shell is a CSS grid with a named `guildsList` area, so this theme simply gives that area its own full-width row and re-flows the list from a column to a row. Tooltips, drag-to-reorder, folders and scrolling all keep their native behaviour.

Works with BetterDiscord, Vencord, Vesktop and Replugged. One file, no `@import`.

This is an inspiration from Gibbu's Horizontal Theme but re-made from scratch. Not a direct fork, but inspired. 
Updates will be made consistently. 

Vencord recommended. I have not tried BetterDiscord yet! 


## Install

Copy `Axiozontal.theme.css` into your client's theme folder and enable it:

| Client | Folder |
|---|---|
| BetterDiscord | `%appdata%\BetterDiscord\themes\` |
| Vencord / Vesktop | `%appdata%\Vencord\themes\` |
| Replugged | `%appdata%\replugged\themes\` |

On Windows you can run `install.ps1` to copy the theme into every client folder that exists on the machine. Add `-Link` to create hard links instead of copies, so edits to this folder show up in Discord after a theme reload.

## Settings

Edit the `:root` block at the top of the file.

| Variable | Default | What it does |
|---|---|---|
| `--hb-position` | `top` | `top` or `bottom` |
| `--hb-bar-height` | Discord's server list width (72px) | Height of the bar |
| `--hb-align` | `flex-start` | `flex-start`, `center` or `flex-end` |
| `--hb-item-gap` | `8px` | Space between server icons |
| `--hb-channel-list-width` | Discord's full sidebar width (268px) | Width of the channel list |
| `--hb-edge-fade` | `24px` | Fade at the scroll edge of the bar, `0` to disable |
| `--hb-folder-group-gap` | `12px` | Space around each expanded folder group |
| `--hb-unread-style` | `corner` | `corner` shows unread as a ringed dot in the icon's top-right, `hidden` shows nothing, `bar` keeps Discord's pill under the icon. Mentions always get Discord's red number badge |
| `--hb-unread-color` | `var(--text-default)` | Colour of the corner dot |
| `--hb-selected-edge` | `top` | `top` or `bottom`: which edge of the icon the selected-server bar sits on |
| `--hb-mention-markers` | `none` | `flex` shows Discord's "new mentions further along" markers at the ends of the bar |
| `--hb-user-panel` | `bar` | `bar` puts the user panel at the right end of the server bar, `sidebar` leaves it under the channel list |
| `--hb-user-panel-width` | `320px` | Width of the user panel when it sits in the bar |

## How it survives Discord updates

Discord renames its hashed class names every few weeks. Every selector in this theme uses a `[class*="name_"]` wildcard on the stable prefix, so a hash change like `guilds__5e434` to `guilds_a1b2c3` does not break it. `reference/selectors.md` records the hashes the theme was written against, so if Discord renames a prefix outright there is a starting point for the fix.

Two automated checks back that up:

- **Validate theme** runs on every push. It parses the CSS, checks the addon metadata header, and rejects any hashed Discord class name that creeps back in.
- **Discord canary** runs every Monday. It downloads the CSS the live Discord web client is serving and confirms that all 47 hooks this theme relies on, every class prefix, CSS variable and grid area, are still there. If one disappears it opens an issue, so a break is usually known before anyone has to report it.

## Versions

Each release is tagged and records the Discord build it was verified against.

| Theme | Discord build | Notes |
|---|---|---|
| v0.2.0 | `fd720496` (desktop 1.0.9257) | User panel in the bar, corner unread dots, horizontal drag-and-drop, folder spacing |
| v0.1.0 | `fd720496` (desktop 1.0.9257) | First release |

`main` is always the newest version. If an update ever misbehaves for you, pin a specific release instead by pointing at its tag:

```
https://raw.githubusercontent.com/AlarkiusJay/VencordAxiozontal/v0.1.0/Axiozontal.theme.css
```

Swap `v0.1.0` for whichever tag you want, or `main` to go back to the latest.

## Plugin support

- **Vencord BetterFolders**: its folder sidebar becomes a second full-width row directly under the bar (above it in bottom mode). The row only exists while a folder is open.
- **Vencord ServerListIndicators**: the online / server counters sit next to the home button.

## Known gaps

- Discord positions tooltips with JavaScript, so server name tooltips still appear to the right of the icon rather than below it.

## Verified

Checked live in Discord desktop 1.0.9257 with Vencord: top and bottom layouts, selected and unread markers, folder previews, BetterFolders row opening and closing, drag-and-drop reordering on both rows, and the user panel.
