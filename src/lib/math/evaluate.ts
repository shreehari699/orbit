/**
 * A small, dependency-free arithmetic evaluator for the Command Center's
 * quick-answer bar. Deliberately not `eval`/`Function` — it tokenizes and
 * parses a strict grammar (numbers, + - * / % ^, parentheses, unary minus)
 * so arbitrary input can never execute as code.
 */

type Token =
  | { kind: "num"; value: number }
  | { kind: "op"; value: "+" | "-" | "*" | "/" | "%" | "^" }
  | { kind: "lparen" }
  | { kind: "rparen" };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === undefined) break;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < input.length && /[0-9.]/.test(input[j]!)) j++;
      const raw = input.slice(i, j);
      const value = Number(raw);
      if (Number.isNaN(value)) throw new Error(`Invalid number: "${raw}"`);
      tokens.push({ kind: "num", value });
      i = j;
      continue;
    }
    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      i++;
      continue;
    }
    if (ch === "x" && tokens.length && tokens[tokens.length - 1]!.kind === "num") {
      // Allow "3 x 4" as an alternative to "3 * 4".
      tokens.push({ kind: "op", value: "*" });
      i++;
      continue;
    }
    if ("+-*/%^".includes(ch)) {
      tokens.push({ kind: "op", value: ch as "+" | "-" | "*" | "/" | "%" | "^" });
      i++;
      continue;
    }
    throw new Error(`Unexpected character: "${ch}"`);
  }
  return tokens;
}

const PRECEDENCE: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };
const RIGHT_ASSOC = new Set(["^"]);

/** Shunting-yard to RPN, then evaluate the RPN. */
function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  let prev: Token | undefined;
  for (const token of tokens) {
    if (token.kind === "num") {
      output.push(token);
    } else if (token.kind === "op") {
      // Unary minus: rewrite "-x" as "0 - x" when it can't be binary.
      const isUnary =
        token.value === "-" &&
        (!prev || prev.kind === "op" || prev.kind === "lparen");
      if (isUnary) {
        output.push({ kind: "num", value: 0 });
      }
      while (
        stack.length &&
        stack[stack.length - 1]!.kind === "op" &&
        (PRECEDENCE[(stack[stack.length - 1] as { value: string }).value]! >
          PRECEDENCE[token.value]! ||
          (PRECEDENCE[(stack[stack.length - 1] as { value: string }).value]! ===
            PRECEDENCE[token.value]! &&
            !RIGHT_ASSOC.has(token.value)))
      ) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else if (token.kind === "lparen") {
      stack.push(token);
    } else if (token.kind === "rparen") {
      while (stack.length && stack[stack.length - 1]!.kind !== "lparen") {
        output.push(stack.pop()!);
      }
      if (!stack.length) throw new Error("Mismatched parentheses");
      stack.pop();
    }
    prev = token;
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top.kind === "lparen") throw new Error("Mismatched parentheses");
    output.push(top);
  }
  return output;
}

function evalRpn(rpn: Token[]): number {
  const stack: number[] = [];
  for (const token of rpn) {
    if (token.kind === "num") {
      stack.push(token.value);
      continue;
    }
    if (token.kind !== "op") throw new Error("Malformed expression");
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) throw new Error("Malformed expression");
    switch (token.value) {
      case "+":
        stack.push(a + b);
        break;
      case "-":
        stack.push(a - b);
        break;
      case "*":
        stack.push(a * b);
        break;
      case "/":
        stack.push(a / b);
        break;
      case "%":
        stack.push(a % b);
        break;
      case "^":
        stack.push(Math.pow(a, b));
        break;
    }
  }
  if (stack.length !== 1) throw new Error("Malformed expression");
  return stack[0]!;
}

/**
 * Evaluates a plain arithmetic expression. Returns `null` (never throws)
 * so callers can treat "not an expression" and "invalid expression" the
 * same way: fall through to the next quick-answer strategy.
 */
export function evaluateExpression(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed || !/[0-9]/.test(trimmed)) return null;
  // Require the input to look arithmetic before attempting to tokenize —
  // avoids treating things like "10 km to miles" as a malformed sum.
  if (!/^[0-9.\s+\-*/%^()x]+$/.test(trimmed)) return null;
  try {
    const tokens = tokenize(trimmed);
    if (!tokens.some((t) => t.kind === "op")) return null;
    const result = evalRpn(toRpn(tokens));
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
