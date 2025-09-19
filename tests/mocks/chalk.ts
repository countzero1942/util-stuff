// Minimal no-op chalk stub for Jest tests (ESM-incompatible package workaround)
// Supports default import `import chalk from "chalk"`
// - Callable: chalk`template` and chalk("text")
// - Common style methods: .bold, .dim, .gray, .red, .green, .yellow, .blue, .cyan, .magenta, .underline
// - Bright variants supported: .blackBright, .redBright, .greenBright, .yellowBright, .blueBright, .magentaBright, .cyanBright, .whiteBright
// - Methods are chainable and return a function that formats strings but does no styling

type Formatter = ((...args: any[]) => string) & { [k: string]: Formatter };

function makeFormatter(): Formatter {
  const f: any = (...args: any[]) => {
    if (args.length === 1 && typeof args[0] === "string") return args[0];
    // Template literal usage: chalk`hello ${x}` comes in as [strings, ...values]
    const first = args[0];
    if (Array.isArray(first) && first && (first as any).raw) {
      const strings = first as string[];
      const values = args.slice(1);
      let out = "";
      for (let i = 0; i < strings.length; i++) {
        out += String(strings[i]);
        if (i < values.length) out += String(values[i]);
      }
      return out;
    }
    return args.map(a => String(a)).join(" ");
  };

  // Common chalk style methods, all chainable and no-op
  const methods = [
    "bold",
    "dim",
    "gray",
    "red",
    "green",
    "yellow",
    "blue",
    "cyan",
    "magenta",
    "underline",
    "bgRed",
    "bgGreen",
    "bgYellow",
    "bgBlue",
    "bgCyan",
    "bgMagenta",
    // bright variants
    "blackBright",
    "redBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright",
    "whiteBright",
  ];
  for (const m of methods) {
    // Chain by returning the same formatter (no-op)
    f[m] = f;
  }
  return f as Formatter;
}

const chalk = makeFormatter();
export default chalk;
