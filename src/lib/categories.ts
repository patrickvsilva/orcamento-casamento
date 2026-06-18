export const VENDOR_CATEGORIES = [
  'Cerimonial e Assessoria',
  'Buffet e Comida',
  'Bebidas',
  'Música',
  'Decoração',
  'Foto e Vídeo',
  'Beleza e Vestuário',
  'Local e Estrutura',
  'Papelaria',
  'Lembrancinhas',
  'Documentação e Cerimônia',
  'Lua de Mel e Viagem',
  'Outros',
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

const LEGACY_CATEGORY_MAP: Record<string, VendorCategory> = {
  Assessoria: 'Cerimonial e Assessoria',
  'Banda/DJ': 'Música',
  Beleza: 'Beleza e Vestuário',
  Buffet: 'Buffet e Comida',
  Convites: 'Papelaria',
  'Doces/Bolo': 'Buffet e Comida',
  'Foto e Vídeo': 'Foto e Vídeo',
  Lembrancinhas: 'Lembrancinhas',
  Local: 'Local e Estrutura',
  'Vestido/Traje': 'Beleza e Vestuário',
  Outros: 'Outros',
  Padrinhos: 'Papelaria',
  Comida: 'Buffet e Comida',
  Música: 'Música',
  Cerimonialista: 'Cerimonial e Assessoria',
  Decoração: 'Decoração',
  Noivos: 'Beleza e Vestuário',
  Bebidas: 'Bebidas',
  'Local e Estrutura': 'Local e Estrutura',
  Cerimônia: 'Documentação e Cerimônia',
  Cerimonia: 'Documentação e Cerimônia',
  Papelaria: 'Papelaria',
};

const VENDOR_CATEGORY_OVERRIDES: Record<string, VendorCategory> = {
  'Caixa convite': 'Papelaria',
  Passagem: 'Lua de Mel e Viagem',
  Alianças: 'Beleza e Vestuário',
  'Sapato e grinalda': 'Beleza e Vestuário',
  'Hobby da Noiva': 'Beleza e Vestuário',
  'Forminhas de doce': 'Buffet e Comida',
  'Bebidas avulso': 'Bebidas',
  Refrigeração: 'Local e Estrutura',
  'Casamento civil': 'Documentação e Cerimônia',
  'Identidade visual': 'Papelaria',
  'welcome drinks': 'Bebidas',
  'Bia serique': 'Foto e Vídeo',
  'Sombrinhas, Leques, porta lagrimas e petalas': 'Lembrancinhas',
};

export function normalizeCategory(rawCategory: string, vendorName?: string): VendorCategory {
  const name = vendorName?.trim();
  if (name) {
    const override = VENDOR_CATEGORY_OVERRIDES[name];
    if (override) return override;
  }

  const trimmed = rawCategory.trim();
  if (!trimmed) return 'Outros';

  const mapped = LEGACY_CATEGORY_MAP[trimmed];
  if (mapped) return mapped;

  if (VENDOR_CATEGORIES.includes(trimmed as VendorCategory)) {
    return trimmed as VendorCategory;
  }

  return 'Outros';
}

export function isVendorCategory(value: string): boolean {
  return VENDOR_CATEGORIES.includes(value as VendorCategory);
}
