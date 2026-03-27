export type OpaAddon = {
  name: string;
  unitPrice: number;
};

export const opaBasePrice = 212.0; // Licença Opa! Suite

export const opaAddons: OpaAddon[] = [
  { name: "Usuário avulso", unitPrice: 30.0 },
  { name: "Whatsapp Partner - Broker IXC", unitPrice: 201.0 },
  { name: "Instagram", unitPrice: 148.0 },
  { name: "WebChat", unitPrice: 148.0 },
  { name: "Messenger", unitPrice: 148.0 },
  { name: "Telefonia", unitPrice: 509.0 },
  { name: "Telegram", unitPrice: 148.0 },
  { name: "Ambiente de IA", unitPrice: 265.0 },
  { name: "Serviço de Página Web", unitPrice: 79.50 },
];

// Collapsible groups inside Mensalidade (select one option per group, or none)
export type OpaGroupOption = {
  label: string;
  price: number;
};

export type OpaCollapsibleGroup = {
  groupName: string;
  options: OpaGroupOption[];
};

export const opaMensalidadeGroups: OpaCollapsibleGroup[] = [
  {
    groupName: "Treinamento Especializado",
    options: [
      { label: "3h adicionais de Treinamento Especializado", price: 239.0 },
      { label: "5h adicionais de Treinamento Especializado", price: 398.0 },
      { label: "9h adicionais de Treinamento Especializado", price: 716.0 },
    ],
  },
  {
    groupName: "Retreinamento",
    options: [
      { label: "3 horas de Retreinamento disponível por 6 meses", price: 239.0 },
      { label: "6 horas de Retreinamentos disponíveis por 6 meses", price: 477.0 },
      { label: "4 horas de Retreinamento disponível por 12 meses", price: 318.0 },
      { label: "8 horas de Retreinamentos disponíveis por 12 meses", price: 636.0 },
    ],
  },
  {
    groupName: "Banco de Templates",
    options: [
      { label: "Banco de Templates (30 Templates)", price: 239.0 },
      { label: "Banco de Templates (50 Templates)", price: 398.0 },
      { label: "Banco de Templates (100 Templates)", price: 795.0 },
    ],
  },
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

// Adesão items (one-time payments)
export const adesaoBasicaPrice = 854.0;
export const fluxoBasicoPrice = 1272.0; // Fluxo Básico entregue e configurado

export type OpaAdesaoItem = {
  name: string;
  price: number;
  description?: string;
  sobAnalise?: boolean;
};

export const opaAdesaoExtras: OpaAdesaoItem[] = [
  { name: "Criação Fluxo Personalizado", price: 3434.0, description: "Sob análise de regra de negócio" },
  { name: "Configurações Básicas: Roleta-Rodízio-Distribuição Automática e Carteirização", price: 318.0 },
  { name: "Configuração e Entrega Gráficos e Relatórios (Looker Studio)", price: 159.0 },
  { name: "Configuração e Entrega Gráficos e Relatórios Personalizados (Looker Studio)", price: 763.0 },
  { name: "Integração ERP, CRM e / ou outro sistema via Low Code", price: 0, sobAnalise: true },
];

// Hourly adesão items (quantity-based, one-time)
export type OpaHourlyAdesaoItem = {
  name: string;
  unitPrice: number;
};

export const opaHourlyAdesaoItems: OpaHourlyAdesaoItem[] = [
  { name: "Hora Análise", unitPrice: 281.0 },
  { name: "Hora Execução", unitPrice: 228.0 },
];

export function getMinOpaCloudPlanIndex(clientCount: number): number {
  for (let i = 0; i < opaCloudPlans.length; i++) {
    if (clientCount <= opaCloudPlans[i].maxClients) return i;
  }
  return opaCloudPlans.length - 1;
}
