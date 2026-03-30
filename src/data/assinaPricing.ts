export type AssinaPackageType = "profissional" | "especialista";

export type AssinaTier = {
  docs: number;
  unitPrice: number;
  packagePrice: number;
  excess: number;
  minValue: number;
};

export const assinaProfissionalTiers: AssinaTier[] = [
  { docs: 20, unitPrice: 3.40, packagePrice: 68.00, excess: 3.17, minValue: 63.00 },
  { docs: 50, unitPrice: 2.72, packagePrice: 136.00, excess: 2.61, minValue: 116.00 },
  { docs: 100, unitPrice: 2.27, packagePrice: 227.00, excess: 2.20, minValue: 190.00 },
  { docs: 200, unitPrice: 2.14, packagePrice: 428.00, excess: 2.09, minValue: 338.00 },
  { docs: 400, unitPrice: 2.02, packagePrice: 808.00, excess: 1.96, minValue: 656.00 },
  { docs: 700, unitPrice: 1.91, packagePrice: 1337.00, excess: 1.85, minValue: 1070.00 },
  { docs: 1000, unitPrice: 1.80, packagePrice: 1800.00, excess: 1.75, minValue: 1356.00 },
  { docs: 1500, unitPrice: 1.70, packagePrice: 2550.00, excess: 1.61, minValue: 1896.00 },
  { docs: 3000, unitPrice: 1.50, packagePrice: 4500.00, excess: 1.48, minValue: 3730.00 },
];

export const assinaEspecialistaTiers: AssinaTier[] = [
  { docs: 20, unitPrice: 4.45, packagePrice: 89.00, excess: 4.23, minValue: 84.00 },
  { docs: 50, unitPrice: 3.78, packagePrice: 189.00, excess: 3.67, minValue: 169.00 },
  { docs: 100, unitPrice: 3.33, packagePrice: 333.00, excess: 3.26, minValue: 296.00 },
  { docs: 200, unitPrice: 3.20, packagePrice: 640.00, excess: 3.14, minValue: 550.00 },
  { docs: 400, unitPrice: 3.08, packagePrice: 1232.00, excess: 3.02, minValue: 1080.00 },
  { docs: 700, unitPrice: 2.97, packagePrice: 2079.00, excess: 2.91, minValue: 1812.00 },
  { docs: 1000, unitPrice: 2.86, packagePrice: 2860.00, excess: 2.81, minValue: 2416.00 },
  { docs: 1500, unitPrice: 2.75, packagePrice: 4125.00, excess: 2.67, minValue: 3486.00 },
  { docs: 3000, unitPrice: 2.56, packagePrice: 7680.00, excess: 2.54, minValue: 6910.00 },
];

export function getAssinaTiers(pkg: AssinaPackageType): AssinaTier[] {
  return pkg === "especialista" ? assinaEspecialistaTiers : assinaProfissionalTiers;
}
