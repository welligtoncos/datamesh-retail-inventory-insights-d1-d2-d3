import { getAthenaTemplateById } from './athena-templates.catalog';
import {
  AthenaQueryParams,
  AthenaTemplateDefinition,
} from './models/athena.model';

export const ATHENA_MAX_ROWS = 100;
export const ATHENA_DEFAULT_LIMIT = 10;
export const ATHENA_MIN_DTS = 2;
export const ATHENA_MAX_DTS = 7;

const ISO_DT = /^\d{4}-\d{2}-\d{2}$/;

export interface AthenaParamsValidation {
  valid: boolean;
  errors: string[];
  normalized: AthenaQueryParams;
}

export function normalizeAthenaDts(dts: string[]): string[] {
  return [...new Set(dts.map((d) => d.trim().slice(0, 10)))].filter(Boolean).sort();
}

export function isValidIsoDt(dt: string): boolean {
  return ISO_DT.test(dt.trim().slice(0, 10));
}

export function validateAthenaParams(
  template: AthenaTemplateDefinition,
  params: AthenaQueryParams = {},
): AthenaParamsValidation {
  const errors: string[] = [];
  const normalized: AthenaQueryParams = {};

  if (template.params_schema.dt?.required) {
    const dt = params.dt?.trim().slice(0, 10);
    if (!dt || !isValidIsoDt(dt)) {
      errors.push('Informe uma partição (dt) válida no formato YYYY-MM-DD.');
    } else {
      normalized.dt = dt;
    }
  } else if (params.dt && isValidIsoDt(params.dt)) {
    normalized.dt = params.dt.trim().slice(0, 10);
  }

  if (template.params_schema.dts) {
    const schema = template.params_schema.dts;
    const dts = normalizeAthenaDts(params.dts ?? []);
    if (dts.length < schema.min_items || dts.length > schema.max_items) {
      errors.push(
        `Selecione entre ${schema.min_items} e ${schema.max_items} partições (dts).`,
      );
    } else if (dts.some((d) => !isValidIsoDt(d))) {
      errors.push('Todas as partições devem estar no formato YYYY-MM-DD.');
    } else {
      normalized.dts = dts;
    }
  }

  if (template.params_schema.limit) {
    const schema = template.params_schema.limit;
    const raw = params.limit ?? schema.default;
    const limit = Math.min(Math.max(1, Math.floor(raw)), Math.min(schema.max, ATHENA_MAX_ROWS));
    normalized.limit = limit;
  }

  return { valid: errors.length === 0, errors, normalized };
}

export function validateAthenaTemplateRequest(
  templateId: string,
  params: AthenaQueryParams = {},
): AthenaParamsValidation {
  const template = getAthenaTemplateById(templateId);
  if (!template) {
    return {
      valid: false,
      errors: ['Template de consulta não encontrado.'],
      normalized: {},
    };
  }
  return validateAthenaParams(template, params);
}
