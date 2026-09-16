# Selector equivalence test

A refactor of the theme's selectors should not change what any element looks like. This page proves that, by rendering a mock of Discord's server-list DOM and diffing the computed styles produced by two versions of the stylesheet.

It exists because it caught a real regression: during the 0.3.0 selector rewrite, the scroller itself stopped matching the rule that turns vertical stacks horizontal, silently dropping the gap between server groups. Nothing in the screenshots showed it.

## Running it

```bash
cd test
cp ../Axiozontal.theme.css new.css
git show v0.2.0:Axiozontal.theme.css > old.css
node serve.mjs
```

Then open `http://127.0.0.1:8731/selector-equivalence.html`. It reports either `IDENTICAL` or a list of every element and property that differs.

Swap `v0.2.0` for whichever baseline you want to compare against. Both `old.css` and `new.css` are gitignored.

## The mock

`selector-equivalence.html` contains a stripped-down copy of Discord's guild-list structure: the app shell grid, the server list nav, the scroller, plain and selected entries with their unread overlay, an expanded folder and a collapsed one, drag-and-drop targets, the separator, mention markers, the channel list and the user panel. Class names come from `../reference/selectors.md`.

The mock is only as good as that fixture. If Discord restructures its DOM, update both files together.
