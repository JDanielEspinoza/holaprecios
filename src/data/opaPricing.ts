export type OpaAddon = {
  name: string;
  unitPrice: number;
};

export const opaBasePrice = 212.0; // Licença Opa! Suite

export const opaAddons: OpaAddon[] = [
  { name: "Usuário avulso", unitPrice: 30.0 },
  { name: "WhatsApp Direct Tech Partner (broker IXC)", unitPrice: 201.0 },
  { name: "Instagram", unitPrice: 148.0 },
  { name: "WebChat", unitPrice: 148.0 },
  { name: "Messenger", unitPrice: 148.0 },
  { name: "Telefonia", unitPrice: 509.0 },
  { name: "Telegram", unitPrice: 148.0 },
  { name: "Ambiente de IA", unitPrice: 265.0 },
];

export type OpaCloudPlan = {
  name: string;
  price: number;
  maxClients: number;
};

export const opaCloudPlans: OpaCloudPlan[] = [
  { name: "Hospedagem até 2.000 atendimentos/mês", price: 99.0, maxClients: 2000 },
  { name: "Hospedagem até 5.000 atendimentos/mês", price: 233.0, maxClients: 5000 },
  { name: "Hospedagem até 10.000 atendimentos/mês", price: 478.0, maxClients: 10000 },
  { name: "Hospedagem até 20.000 atendimentos/mês", price: 618.0, maxClients: 20000 },
  { name: "Hospedagem até 40.000 atendimentos/mês", price: 1283.0, maxClients: 40000 },
  { name: "Hospedagem até 60.000 atendimentos/mês", price: 1982.0, maxClients: 60000 },
  { name: "Hospedagem até 100.000 atendimentos/mês", price: 2565.0, maxClients: 100000 },
];

export const adesaoBasicaPrice = 854.0;
export const fluxoPersonalizadoPrice = 0.0; // "sob análise"

export function getMinOpaCloudPlanIndex(clientCount: number): number {
  for (let i = 0; i < opaCloudPlans.length; i++) {
    if (clientCount <= opaCloudPlans[i].maxClients) return i;
  }
  return opaCloudPlans.length - 1;
}
