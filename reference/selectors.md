# Discord selectors this theme was written against

Captured 2026-09-14 from the CSS bundles served by `discord.com/app` (Discord desktop 1.0.9257). Use this to repair the theme if Discord renames a class prefix.

## App shell (`.base__5e434` bundle)

```css
@supports (grid-template-columns:subgrid) and (white-space-collapse:collapse) {
  .base__5e434 {
    display: grid;
    grid-template-areas: "titleBar titleBar titleBar" "guildsList notice notice" "guildsList channelsList page";
    grid-template-columns: [start] min-content [guildsEnd] min-content [channelsEnd] 1fr [end];
    grid-template-rows: [top] var(--custom-app-top-bar-height) [titleBarEnd] min-content [noticeEnd] 1fr [end];
  }
  .base__5e434[data-fullscreen=true] { grid-template-rows: [top] min-content [titleBarEnd] min-content [noticeEnd] 1fr [end]; }
  .content__5e434 { display: grid; grid-column: start/end; grid-row: titleBarEnd/end; grid-template-columns: subgrid; grid-template-rows: subgrid; }
  .page__5e434 { grid-area: page; overflow: auto; }
  .sidebar__5e434 { display: grid; grid-column: start/channelsEnd; grid-row: titleBarEnd/end; grid-template-columns: subgrid; grid-template-rows: subgrid; }
  .sidebarList__5e434 { grid-area: channelsList; }
  .wrapper_ef3116 { grid-area: guildsList; }   /* the server list <nav> */
  .notice__6e2b9, .notice__29487 { grid-area: notice; }
  .bar_c38106 { grid-area: titleBar; }
}
.sidebar__5e434 { width: var(--custom-guild-sidebar-width); }              /* 268px */
.sidebarList__5e434 { width: calc(var(--custom-guild-sidebar-width) - var(--custom-guild-list-width) - 1px); }
.sidebar__5e434[data-collapsed=true] { width: calc(var(--custom-guild-list-width) + 4px) !important; }
.guilds__5e434 { flex-shrink: 0; min-width: 0; position: relative; width: var(--custom-guild-list-width); }
```

The `<nav>` carries both `wrapper_ef3116` and `guilds__5e434`, plus `aria-label="Servers sidebar"`.

## Server list internals (`_ef3116`)

```css
.wrapper_ef3116 { display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; position:relative; width:var(--custom-guild-list-width);
  margin-bottom: calc(var(--custom-app-panels-height, 0) + var(--space-xs) - 16px);
  mask: linear-gradient(180deg,#000,transparent) bottom/100% 16px no-repeat, linear-gradient(#000,#000) top/100% calc(100% - 15px) no-repeat; }
.tree_ef3116 { display:flex; flex-direction:column; height:100%; justify-content:space-between; position:relative; }
.scroller_ef3116 { flex:0 1 auto; padding:0; padding-bottom:calc(var(--space-xs,8px) + 16px)!important; user-select:none; }
.scroller_ef3116 > [hidden] { margin-top: calc(var(--space-xs) * -1); visibility: hidden; }
.platform-win .scroller_ef3116 { padding-top: 4px; }
.unreadMentionsIndicatorTop_ef3116, .unreadMentionsIndicatorBottom_ef3116 { position:absolute; inset-inline:0; width:var(--custom-guild-list-width); padding:8px; z-index:10; pointer-events:none; }
.unreadMentionsIndicatorTop_ef3116 { top:0; }  .unreadMentionsIndicatorBottom_ef3116 { bottom:0; }
.unreadMentionsFixedFooter_ef3116 { bottom:0; }
.bottomRailNotifCenterButton_ef3116 { padding-bottom:12px; padding-top:8px; }  /* ::before is a 16px vertical fade */
```

## List items, folders, badges

```css
.listItem__650eb { display:flex; justify-content:center; margin:0; position:relative; width:var(--custom-guild-list-width); }
.listItemWrapper__91816, .blobContainer_e5445c   /* icon button */
.wrapper__6e9f8, .childWrapper__6e9f8 { height/width: var(--guildbar-avatar-size); }   /* 40px, or 44px */
.guildSeparator__252b6 { height:1px; width:32px; }  .fullWidth__252b6 { width:100%; }
.dragInner__87847 { height/width: var(--guildbar-avatar-size); }  .isFolder__87847 { var(--guildbar-folder-size); }  /* 48px / 52px */
.circleIconButton_a2be55 { 40x40 }   /* Discover, Add a Server */
.lowerBadge_cc5dd2 { position:absolute; bottom:0; inset-inline-end:0; }  .upperBadge_cc5dd2 { top:0; inset-inline-end:0; }
.stack_dbd263[data-direction=vertical] { flex-direction: column; }

.folderGroup__48112 { position:relative; width:var(--custom-guild-list-width); }
.folderGroupBackground__48112 { position:absolute; top:0; bottom:0; width:var(--guildbar-folder-size);
  inset-inline-start: calc(var(--custom-guild-list-padding) - (var(--guildbar-folder-size) - var(--guildbar-avatar-size))/2); opacity:0; }
.isExpanded__48112 .folderGroupBackground__48112 { opacity:1; }
.folderGuildsList__48112 { overflow:hidden; }
.folderGuildsList__48112 > :first-child { margin-top: calc(var(--space-xs) - var(--custom-folder-padding)); }
.folderHeaderSmall__48112 { margin: calc((var(--guildbar-avatar-size) - var(--guildbar-folder-size))/2) 0; }
.folderEndWrapper_d144f8 { height:0; }  .folderEndWrapper_d144f8.wrapperOver_d144f8 { height:24px; }
.wrapper_d144f8 { drag targets: absolute, flex column, top:-16px bottom:-4px }
```

The selected/unread pill has no rule in the static bundles. Live DOM (captured with DevTools):

```
div.listItem__650eb
  div.wrapper__58105.overlay__58105        <- 8px x 72px column on the left edge
    span.item__58105[.visible][.selected]  <- 8px wide, height 8/20/40px, border-radius 0 4px 4px 0, transform translateX(-4px)
  span > div.listItemWrapper__91816 / div.blobContainer_e5445c   <- the icon
  div.wrapper_d144f8                        <- drag targets
```

The theme targets it as `[class*="listItem_"] > [class*="overlay_"] > [class*="item_"]`.

## Vencord BetterFolders

The plugin adds `.vc-betterFolders-sidebar-grid` to `.base_` and injects `div.vc-betterFolders-sidebar` (inline `width: 72px`) inside `.sidebar_`, containing a second `nav.wrapper_ef3116.guilds__5e434`. Its CSS:

```css
.vc-betterFolders-sidebar { grid-area: betterFoldersSidebar; }
.vc-betterFolders-sidebar-grid {
  grid-template-columns: [start] min-content [guildsEnd] min-content [sidebarEnd] min-content [channelsEnd] 1fr [end];
  grid-template-areas: "titleBar titleBar titleBar titleBar" "guildsList betterFoldersSidebar notice notice" "guildsList betterFoldersSidebar channelsList page";
}
```

Expanded folder markup inside either nav: `div.folderGroup__48112.isExpanded__48112 > span.folderGroupBackground__48112 + div.listItem__650eb (header) + ul.stack_dbd263.folderGuildsList__48112[style="height: Npx"] + div.folderEndWrapper_d144f8`.

Also seen: `section.panels__5e434` (user panel) is a direct child of `.sidebar_`, absolutely positioned at its bottom with `width: calc(100% - spacing*2)`.

## Variables

```
--custom-guild-list-width: calc(var(--guildbar-avatar-size) + var(--custom-guild-list-padding)*2)   /* 72px */
--custom-guild-list-padding: var(--space-md)  (16px)   or min(var(--space-md), var(--space-16))
--custom-guild-sidebar-width: 268px
--guildbar-avatar-size: 40px | 44px
--guildbar-folder-size: 48px | 52px
--custom-app-top-bar-height: 32px  (24px / 40px with refresh-title-bar-small / -large)
```
