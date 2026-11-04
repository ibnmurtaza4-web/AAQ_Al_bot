/**
 * Safe and high-performance Math Engine for Telegram Bot
 * Evaluates arithmetic, formulas, percentages, powers, and simple algebraic equations
 */

export interface MathResult {
  success: boolean;
  expression: string;
  result?: string;
  steps?: string[];
  error?: string;
}

export function solveMathExpression(input: string): MathResult {
  const raw = input.trim();
  if (!raw) {
    return { success: false, expression: '', error: 'Riyazi ifadə boşdur.' };
  }

  // Check for simple algebraic equation like 2x + 5 = 25 or 3x - 9 = 0
  const eqMatch = raw.match(/^([0-9\.\s\+\-\*\/\^\(\)]*)\s*([a-zA-Z])\s*([\+\-\*\/]\s*[0-9\.]+)?\s*=\s*([0-9\.\+\-\*\/\s\(\)]+)$/);
  if (eqMatch) {
    try {
      const varName = eqMatch[2];
      const coeffStr = eqMatch[1].replace(/\s+/g, '').replace(/\*$/, '') || '1';
      const opAndConst = eqMatch[3] ? eqMatch[3].replace(/\s+/g, '') : '+0';
      const rightSideRaw = eqMatch[4];

      const coeff = coeffStr === '-' ? -1 : (coeffStr === '+' || coeffStr === '' ? 1 : Number(coeffStr));
      const rightVal = evalSafeArithmetic(rightSideRaw);
      const constantVal = evalSafeArithmetic(opAndConst);

      if (!isNaN(coeff) && !isNaN(rightVal) && !isNaN(constantVal)) {
        // coeff * x + constantVal = rightVal
        // coeff * x = rightVal - constantVal
        // x = (rightVal - constantVal) / coeff
        const step1 = `${coeff !== 1 ? coeff : ''}${varName} = ${rightVal} - (${constantVal})`;
        const diff = rightVal - constantVal;
        const finalVal = diff / coeff;
        const formatted = Number.isInteger(finalVal) ? finalVal.toString() : finalVal.toFixed(4).replace(/\.?0+$/, '');

        return {
          success: true,
          expression: raw,
          result: `${varName} = ${formatted}`,
          steps: [
            `1. Tənlik: ${raw}`,
            `2. Məchul həddi tək saxlayaq: ${step1}`,
            `3. Sadələşdirmə: ${coeff !== 1 ? `${coeff}${varName} = ${diff}` : `${varName} = ${diff}`}`,
            `4. Yekun Həll: ${varName} = ${formatted}`
          ]
        };
      }
    } catch {}
  }

  // Arithmetic evaluation
  try {
    let expr = raw
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/,/g, '.')
      .replace(/π|pi/gi, Math.PI.toString())
      .replace(/\be\b/gi, Math.E.toString());

    // Handle sqrt(x)
    expr = expr.replace(/sqrt\(([^)]+)\)/gi, (_, val) => `Math.sqrt(${val})`);
    expr = expr.replace(/kök\(([^)]+)\)/gi, (_, val) => `Math.sqrt(${val})`);
    expr = expr.replace(/√([0-9\.]+)/g, (_, val) => `Math.sqrt(${val})`);

    // Handle power ^ -> **
    expr = expr.replace(/\^/g, '**');

    // Handle percentages like 20% * 500 or 15%
    expr = expr.replace(/([0-9\.]+)%/g, '($1 / 100)');

    // Sanitize to only allow valid math characters
    const sanitized = expr.replace(/Math\.(sqrt|sin|cos|tan|log|abs|floor|ceil)/g, '');
    if (!/^[0-9\s\+\-\*\/\.\(\)\*]+$/.test(sanitized)) {
      return { success: false, expression: raw, error: 'İfadə yalnız riyazi simvollardan ibarət olmalıdır.' };
    }

    const calculated = Function(`'use strict'; return (${expr})`)();

    if (typeof calculated === 'number' && !isNaN(calculated) && isFinite(calculated)) {
      const formatted = Number.isInteger(calculated) 
        ? calculated.toLocaleString('az-AZ') 
        : Number(calculated.toFixed(6)).toString();

      return {
        success: true,
        expression: raw,
        result: formatted,
        steps: [
          `1. Verilən İfadə: ${raw}`,
          `2. Hesablama Qaydası: Əməllər ardıcıllığı (mötərizələr, qüvvət, vurma/bölmə, toplama/çıxma)`,
          `3. Yekun Nəticə: ${formatted}`
        ]
      };
    }
  } catch (err: any) {
    return { success: false, expression: raw, error: err?.message || 'Hesablama xətası' };
  }

  return { success: false, expression: raw, error: 'Hesablama aparıla bilmədi' };
}

function evalSafeArithmetic(expr: string): number {
  const clean = expr.replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
  if (!clean) return 0;
  return Function(`'use strict'; return (${clean})`)();
}
