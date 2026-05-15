import { RGBA, SyntaxStyle } from "@opentui/core";

export const colors = {
  background: "#000000",
  foreground: "#ffffff",
  foregroundDim: "#888888",
  foregroundHighlight: "#000000",
  backgroundHighlight: "#ffffff",
  accentPrimary: "#5592b5",
  accentSecondary: "#37823f"
}

export const markdownStyles = SyntaxStyle.fromStyles({
  "markup.heading.1": {
    fg: RGBA.fromHex(colors.accentPrimary),
    bg: RGBA.fromHex(colors.background),
    bold: true,
  },
  "markup.heading.2": {
    fg: RGBA.fromHex(colors.accentSecondary),
    bg: RGBA.fromHex(colors.background),
    bold: true,
  },
  "markup.heading.3": {
    fg: RGBA.fromHex(colors.accentSecondary),
    bg: RGBA.fromHex(colors.background),
    bold: true,
  },
  "markup.list": {
    fg: RGBA.fromHex(colors.accentSecondary),
    bg: RGBA.fromHex(colors.background),
  },
  "markup.italic": {
    fg: RGBA.fromHex(colors.foregroundDim),
    bg: RGBA.fromHex(colors.background),
    italic: true,
  },
  "markup.bold": {
    fg: RGBA.fromHex(colors.foreground),
    bg: RGBA.fromHex(colors.background),
    bold: true,
  },
  default: {
    fg: RGBA.fromHex(colors.foreground),
    bg: RGBA.fromHex(colors.background),
  },
});


