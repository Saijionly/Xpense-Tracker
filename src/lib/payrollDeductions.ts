// Reference rates used here (2026): SSS — 15% total / 5% employee share, MSC floor
// ₱5,000, ceiling ₱35,000 (RA 11199). PhilHealth — 5% total / 2.5% employee share,
// salary floor ₱10,000, ceiling ₱100,000 (RA 11223). Pag-IBIG — 2% employee share,
// salary cap ₱10,000 (HDMF Circular 274). Withholding tax uses the BIR TRAIN Law
// revised monthly table (effective 2023 onward).
//
// These are simplified estimates for personal budgeting. Your actual payslip may
// differ slightly depending on your employer's payroll setup — treat this as a
// helpful approximation, not an official computation.

export interface PayrollDeductions {
  sss: number;
  philHealth: number;
  pagIbig: number;
  withholdingTax: number;
  totalDeductions: number;
  netPay: number;
}

function computeSSS(monthlySalary: number): number {
  const msc = Math.min(Math.max(monthlySalary, 5000), 35000);
  return Math.round(msc * 0.05 * 100) / 100;
}

function computePhilHealth(monthlySalary: number): number {
  const basic = Math.min(Math.max(monthlySalary, 10000), 100000);
  return Math.round(basic * 0.025 * 100) / 100;
}

function computePagIbig(monthlySalary: number): number {
  const basic = Math.min(monthlySalary, 10000);
  return Math.round(basic * 0.02 * 100) / 100;
}

function computeWithholdingTax(taxableIncome: number): number {
  if (taxableIncome <= 20833) return 0;
  if (taxableIncome <= 33333) return (taxableIncome - 20833) * 0.15;
  if (taxableIncome <= 66667) return 1875 + (taxableIncome - 33333) * 0.2;
  if (taxableIncome <= 166667) return 8541.8 + (taxableIncome - 66667) * 0.25;
  if (taxableIncome <= 666667) return 33541.8 + (taxableIncome - 166667) * 0.3;
  return 183541.8 + (taxableIncome - 666667) * 0.35;
}

export function computePayrollDeductions(monthlySalary: number): PayrollDeductions {
  const sss = computeSSS(monthlySalary);
  const philHealth = computePhilHealth(monthlySalary);
  const pagIbig = computePagIbig(monthlySalary);
  const taxableIncome = monthlySalary - sss - philHealth - pagIbig;
  const withholdingTax = Math.round(computeWithholdingTax(taxableIncome) * 100) / 100;
  const totalDeductions = Math.round((sss + philHealth + pagIbig + withholdingTax) * 100) / 100;
  const netPay = Math.round((monthlySalary - totalDeductions) * 100) / 100;

  return { sss, philHealth, pagIbig, withholdingTax, totalDeductions, netPay };
}