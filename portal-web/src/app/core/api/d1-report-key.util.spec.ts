import { buildD1DownloadFilename, buildD1ReportS3Key } from './d1-report-key.util';

describe('d1-report-key.util', () => {
  it('builds S3 key aligned with Lambda D-1', () => {
    expect(buildD1ReportS3Key('2022-01-02', '2022-01-01')).toBe(
      'relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx',
    );
  });

  it('builds friendly download filename', () => {
    expect(buildD1DownloadFilename('2022-01-02', '2022-01-01')).toBe(
      'relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx',
    );
  });
});
