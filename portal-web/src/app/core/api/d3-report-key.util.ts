import { normalizeD1Dt } from './d1-date.util';

export function buildD3ReportS3Key(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorios/D3/relatorio_D3_exec${exec}_dado${dado}.xlsx`;
}

export function buildD3DownloadFilename(dataExecucao: string, diaDado: string): string {
  const exec = normalizeD1Dt(dataExecucao);
  const dado = normalizeD1Dt(diaDado);
  return `relatorio_D3_exec${exec}_dado${dado}.xlsx`;
}
