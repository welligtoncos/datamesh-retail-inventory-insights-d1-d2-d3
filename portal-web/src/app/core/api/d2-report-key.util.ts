import { normalizeD1Dt } from './d1-date.util';

export function buildD2ReportS3Key(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorios/D2/relatorio_D2_exec${exec}_dado${dado}.xlsx`;
}

export function buildD2DownloadFilename(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorio_D2_exec${exec}_dado${dado}.xlsx`;
}
