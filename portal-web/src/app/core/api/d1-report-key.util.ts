import { normalizeD1Dt } from './d1-date.util';

export function buildD1ReportS3Key(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorios/D1/relatorio_D1_exec${exec}_dado${dado}.xlsx`;
}

export function buildD1DownloadFilename(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorio_D1_exec${exec}_dado${dado}.xlsx`;
}
