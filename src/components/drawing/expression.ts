// src/components/drawing/expression.ts
// "x^2 - 3", "2sin(x)+1" gibi matematik ifadelerini güvenli biçimde
// hesaplanabilir bir fonksiyona çeviren küçük ayrıştırıcı.
//
// Bilerek `eval` / `new Function` KULLANILMAZ: uygulama katı bir içerik
// güvenlik politikası altında çalışabilir ve kullanıcı metni koda dönüşmemelidir.
//
// Dilbilgisi (özyinelemeli iniş):
//   expr   := term (('+' | '-') term)*
//   term   := power (('*' | '/' | örtük çarpım) power)*
//   power  := unary ('^' power)?        // sağ birleşimli
//   unary  := ('-' | '+') unary | atom
//   atom   := sayı | sabit | 'x' | fn '(' expr (',' expr)* ')' | '(' expr ')'

type Fn1 = (a: number) => number;
type Fn2 = (a: number, b: number) => number;

const FUNCS_1: Record<string, Fn1> = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    cot: (a) => 1 / Math.tan(a),
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    sqrt: Math.sqrt,
    kok: Math.sqrt,
    abs: Math.abs,
    mutlak: Math.abs,
    ln: Math.log,
    log: Math.log10,
    log10: Math.log10,
    log2: Math.log2,
    exp: Math.exp,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    sign: Math.sign,
};

const FUNCS_2: Record<string, Fn2> = {
    min: Math.min,
    max: Math.max,
    pow: Math.pow,
    mod: (a, b) => a % b,
    atan2: Math.atan2,
    log: (a, b) => Math.log(a) / Math.log(b),
};

const CONSTS: Record<string, number> = {
    pi: Math.PI,
    'π': Math.PI,
    e: Math.E,
    tau: Math.PI * 2,
};

type Token =
    | { t: 'num'; v: number }
    | { t: 'name'; v: string }
    | { t: 'op'; v: string };

function tokenize(src: string): Token[] {
    const s = src
        .replace(/,(\d)/g, '.$1') // Türkçe ondalık virgülü
        .replace(/[·×]/g, '*')
        .replace(/[÷:]/g, '/')
        .replace(/−/g, '-')
        .replace(/√/g, 'sqrt')
        .toLowerCase();
    const out: Token[] = [];
    let i = 0;
    while (i < s.length) {
        const ch = s[i];
        if (ch === ' ' || ch === '\t') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let j = i;
            while (j < s.length && /[0-9.]/.test(s[j])) j++;
            const v = Number(s.slice(i, j));
            if (!Number.isFinite(v)) throw new Error(`Geçersiz sayı: ${s.slice(i, j)}`);
            out.push({ t: 'num', v });
            i = j;
            continue;
        }
        if (/[a-zçğıöşü_π]/.test(ch)) {
            let j = i;
            while (j < s.length && /[a-z0-9çğıöşü_π]/.test(s[j])) j++;
            out.push({ t: 'name', v: s.slice(i, j) });
            i = j;
            continue;
        }
        if ('+-*/^(),'.includes(ch)) {
            out.push({ t: 'op', v: ch });
            i++;
            continue;
        }
        throw new Error(`Tanınmayan karakter: ${ch}`);
    }
    return out;
}

/**
 * İfadeyi ayrıştırır ve `(x) => sayı` fonksiyonu döndürür.
 * Ayrıştırma başarısızsa `Error` fırlatır.
 */
export function compileExpression(input: string): (x: number) => number {
    // "y = ..." / "f(x) = ..." ön ekini at.
    const cleaned = input.replace(/^\s*(y|f\s*\(\s*x\s*\))\s*=/i, '');
    const tokens = tokenize(cleaned);
    if (tokens.length === 0) throw new Error('İfade boş.');

    let pos = 0;
    const peek = (): Token | undefined => tokens[pos];
    const eatOp = (v: string): boolean => {
        const t = peek();
        if (t && t.t === 'op' && t.v === v) {
            pos++;
            return true;
        }
        return false;
    };

    const parseExpr = (): Fn1 => {
        let left = parseTerm();
        for (;;) {
            if (eatOp('+')) {
                const right = parseTerm();
                const l = left;
                left = (x) => l(x) + right(x);
            } else if (eatOp('-')) {
                const right = parseTerm();
                const l = left;
                left = (x) => l(x) - right(x);
            } else break;
        }
        return left;
    };

    const startsAtom = (): boolean => {
        const t = peek();
        if (!t) return false;
        if (t.t === 'num' || t.t === 'name') return true;
        return t.t === 'op' && t.v === '(';
    };

    const parseTerm = (): Fn1 => {
        let left = parsePower();
        for (;;) {
            if (eatOp('*')) {
                const right = parsePower();
                const l = left;
                left = (x) => l(x) * right(x);
            } else if (eatOp('/')) {
                const right = parsePower();
                const l = left;
                left = (x) => l(x) / right(x);
            } else if (startsAtom()) {
                // Örtük çarpım: 2x, 3sin(x), (x+1)(x-1)
                const right = parsePower();
                const l = left;
                left = (x) => l(x) * right(x);
            } else break;
        }
        return left;
    };

    const parsePower = (): Fn1 => {
        const base = parseUnary();
        if (eatOp('^')) {
            const exp = parsePower(); // sağ birleşimli
            return (x) => Math.pow(base(x), exp(x));
        }
        return base;
    };

    const parseUnary = (): Fn1 => {
        if (eatOp('-')) {
            const inner = parseUnary();
            return (x) => -inner(x);
        }
        if (eatOp('+')) return parseUnary();
        return parseAtom();
    };

    const parseAtom = (): Fn1 => {
        const t = peek();
        if (!t) throw new Error('İfade beklenmedik şekilde bitti.');

        if (t.t === 'num') {
            pos++;
            const v = t.v;
            return () => v;
        }
        if (t.t === 'op' && t.v === '(') {
            pos++;
            const inner = parseExpr();
            if (!eatOp(')')) throw new Error('Kapanmayan parantez.');
            return inner;
        }
        if (t.t === 'name') {
            pos++;
            const name = t.v;
            if (eatOp('(')) {
                const args: Fn1[] = [parseExpr()];
                while (eatOp(',')) args.push(parseExpr());
                if (!eatOp(')')) throw new Error(`${name}( için kapanış parantezi yok.`);
                if (args.length === 1 && FUNCS_1[name]) {
                    const fn = FUNCS_1[name];
                    const a = args[0];
                    return (x) => fn(a(x));
                }
                if (args.length === 2 && FUNCS_2[name]) {
                    const fn = FUNCS_2[name];
                    const [a, b] = args;
                    return (x) => fn(a(x), b(x));
                }
                throw new Error(`Bilinmeyen fonksiyon: ${name}`);
            }
            if (name === 'x') return (x) => x;
            if (name in CONSTS) {
                const v = CONSTS[name];
                return () => v;
            }
            throw new Error(`Bilinmeyen değişken: ${name}`);
        }
        throw new Error(`Beklenmeyen simge: ${t.v}`);
    };

    const fn = parseExpr();
    if (pos < tokens.length) throw new Error('İfadenin sonu okunamadı.');
    // Derleme sırasında bir kez deneyerek erken hata yakala.
    fn(1);
    return fn;
}

/** İfade geçerli mi? Geçersizse hata mesajını döndürür. */
export function validateExpression(input: string): string | null {
    try {
        compileExpression(input);
        return null;
    } catch (e) {
        return e instanceof Error ? e.message : 'İfade çözümlenemedi.';
    }
}
