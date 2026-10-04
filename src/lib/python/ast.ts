import type { Float } from './values'

export interface Node {
  line: number
}

/* ------------------------------- Literals ------------------------------- */

export interface NumberLit extends Node {
  kind: 'NumberLit'
  value: number | Float
}
export interface StringLit extends Node {
  kind: 'StringLit'
  value: string
}
export interface FStringLit extends Node {
  kind: 'FStringLit'
  parts: FStringContentPart[]
}
export type FStringContentPart =
  | { type: 'literal'; value: string }
  | {
      type: 'expr'
      expr: Expr
      conversion: 'r' | 's' | 'a' | null
      spec: string | null
      line: number
    }
export interface BoolLit extends Node {
  kind: 'BoolLit'
  value: boolean
}
export interface NoneLit extends Node {
  kind: 'NoneLit'
}
export interface ListLit extends Node {
  kind: 'ListLit'
  elements: Expr[]
}
export interface TupleLit extends Node {
  kind: 'TupleLit'
  elements: Expr[]
}
export interface DictLit extends Node {
  kind: 'DictLit'
  entries: { key: Expr; value: Expr }[]
}
export interface SetLit extends Node {
  kind: 'SetLit'
  elements: Expr[]
}

/* ------------------------------ Expressions ----------------------------- */

export interface NameExpr extends Node {
  kind: 'NameExpr'
  name: string
}
export interface UnaryExpr extends Node {
  kind: 'UnaryExpr'
  op: '-' | '+' | '~'
  operand: Expr
}
export interface NotExpr extends Node {
  kind: 'NotExpr'
  operand: Expr
}
export interface BoolExpr extends Node {
  kind: 'BoolExpr'
  op: 'and' | 'or'
  left: Expr
  right: Expr
}
export type CompareOp =
  | '=='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'in'
  | 'not in'
  | 'is'
  | 'is not'
/** `a < b < c` is one flat node so the middle operand is reused, as in Python. */
export interface CompareExpr extends Node {
  kind: 'CompareExpr'
  left: Expr
  comparators: { op: CompareOp; expr: Expr }[]
}
export interface BinOpExpr extends Node {
  kind: 'BinOpExpr'
  op: '+' | '-' | '*' | '/' | '//' | '%' | '**'
  left: Expr
  right: Expr
}
export interface CallExpr extends Node {
  kind: 'CallExpr'
  callee: Expr
  args: Expr[]
  keywords: { name: string; value: Expr }[]
}
export interface AttrExpr extends Node {
  kind: 'AttrExpr'
  target: Expr
  attr: string
}
export interface IndexExpr extends Node {
  kind: 'IndexExpr'
  target: Expr
  index: Expr
}
export interface SliceExpr extends Node {
  kind: 'SliceExpr'
  target: Expr
  start: Expr | null
  stop: Expr | null
  step: Expr | null
}
export interface TernaryExpr extends Node {
  kind: 'TernaryExpr'
  body: Expr
  test: Expr
  orelse: Expr
}
/** `[expr for target in iterable if test]` — the single-clause subset. */
export interface ComprehensionExpr extends Node {
  kind: 'Comprehension'
  element: Expr
  target: string
  iter: Expr
  test: Expr | null
}
export type Expr =
  | NumberLit
  | StringLit
  | FStringLit
  | BoolLit
  | NoneLit
  | ListLit
  | TupleLit
  | DictLit
  | SetLit
  | NameExpr
  | UnaryExpr
  | NotExpr
  | BoolExpr
  | CompareExpr
  | BinOpExpr
  | CallExpr
  | AttrExpr
  | IndexExpr
  | SliceExpr
  | TernaryExpr
  | ComprehensionExpr

/* ------------------------------ Statements ------------------------------ */

export interface ExprStmt extends Node {
  kind: 'ExprStmt'
  expr: Expr
}
export type AssignTarget =
  | { kind: 'name'; name: string }
  | { kind: 'unpack'; names: string[] }
  | { kind: 'item'; target: Expr; index: Expr }

export interface AssignStmt extends Node {
  kind: 'AssignStmt'
  targets: AssignTarget[]
  value: Expr
}
export interface AugAssignStmt extends Node {
  kind: 'AugAssignStmt'
  target: AssignTarget
  op: BinOpExpr['op']
  value: Expr
}
export interface IfStmt extends Node {
  kind: 'IfStmt'
  test: Expr
  body: Stmt[]
  orelse: Stmt[]
}
export interface WhileStmt extends Node {
  kind: 'WhileStmt'
  test: Expr
  body: Stmt[]
}
export interface ForStmt extends Node {
  kind: 'ForStmt'
  /** One name, or several for tuple unpacking: `for a, b in pairs:` */
  target: string[]
  iter: Expr
  body: Stmt[]
}
export interface BreakStmt extends Node {
  kind: 'BreakStmt'
}
export interface ContinueStmt extends Node {
  kind: 'ContinueStmt'
}
export interface PassStmt extends Node {
  kind: 'PassStmt'
}
/** Statements we recognise but do not execute (e.g. `def`, `import`). */
export interface UnsupportedStmt extends Node {
  kind: 'UnsupportedStmt'
  label: string
  hint: string
}
export type Stmt =
  | ExprStmt
  | AssignStmt
  | AugAssignStmt
  | IfStmt
  | WhileStmt
  | ForStmt
  | BreakStmt
  | ContinueStmt
  | PassStmt
  | UnsupportedStmt

export interface Program {
  kind: 'Program'
  body: Stmt[]
}
