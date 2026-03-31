export interface InmapSalesTier {
  plan: string;
  range: string;
  price: number;
}

export interface InmapServiceTier {
  plan: string;
  range: string;
  price: number;
  taxaImplantacao: number; // 0 = gratuito, -1 = personalizado
  personalizado?: boolean;
}

export interface InmapFiberdocsTier {
  plan: string;
  range: string;
  price: number;
}

export const inmapSalesTiers: InmapSalesTier[] = [
  { plan: "START", range: "Até 3.000", price: 310 },
  { plan: "ESSENCIAL", range: "3.001 - 6.000", price: 461 },
  { plan: "MEDIUM", range: "6.001 - 12.000", price: 613 },
  { plan: "BUSINESS", range: "12.001 - 24.000", price: 771 },
  { plan: "PREMIUM", range: "24.001 - 48.000", price: 922 },
  { plan: "FULL", range: "Acima de 48.000", price: 1079 },
];

export const inmapServiceTiers: InmapServiceTier[] = [
  { plan: "START", range: "Até 500", price: 212, taxaImplantacao: 0 },
  { plan: "LITE", range: "501 - 1.000", price: 371, taxaImplantacao: 0 },
  { plan: "ESSENCIAL", range: "1.001 - 2.000", price: 636, taxaImplantacao: 763 },
  { plan: "STANDARD", range: "2.001 - 3.000", price: 795, taxaImplantacao: 954 },
  { plan: "MEDIUM", range: "3.001 - 4.000", price: 975, taxaImplantacao: 1170 },
  { plan: "SMART", range: "4.001 - 5.000", price: 1113, taxaImplantacao: 1336 },
  { plan: "PRO", range: "5.001 - 8.000", price: 1611, taxaImplantacao: 1933 },
  { plan: "BUSINESS", range: "8.001 - 10.000", price: 1908, taxaImplantacao: 2290 },
  { plan: "PLUS", range: "10.001 - 15.000", price: 2226, taxaImplantacao: 2671 },
  { plan: "PREMIUM", range: "15.001 - 30.000", price: 3180, taxaImplantacao: 3816 },
  { plan: "ULTRA", range: "30.001 - 50.000", price: 4240, taxaImplantacao: 5088 },
  { plan: "ADVANCED", range: "50.001 - 80.000", price: 5936, taxaImplantacao: 7123 },
  { plan: "ULTIMATE", range: "80.001 - 100.000", price: 6360, taxaImplantacao: 7632 },
  { plan: "FULL", range: "Acima de 100.001", price: -1, taxaImplantacao: -1, personalizado: true },
];

export const inmapFiberdocsTiers: InmapFiberdocsTier[] = [
  { plan: "START", range: "Até 1.000", price: 310 },
  { plan: "ESSENCIAL", range: "1.001 - 3.000", price: 461 },
  { plan: "MEDIUM", range: "3.001 - 8.000", price: 613 },
  { plan: "BUSINESS", range: "8.001 - 15.000", price: 771 },
  { plan: "PREMIUM", range: "15.001 - 30.000", price: 922 },
  { plan: "FULL", range: "Acima de 30.000", price: 1079 },
];

// Taxa de Implantação rules for Inmap Service:
// - 10% discount allowed with installments
// - Min installment: R$ 530,00
// - Max installments: 6x
// - First payment required before implementation starts
export const TAXA_MIN_PARCELA = 530;
export const TAXA_MAX_PARCELAS = 6;
export const TAXA_DESCONTO_PCT = 10;
