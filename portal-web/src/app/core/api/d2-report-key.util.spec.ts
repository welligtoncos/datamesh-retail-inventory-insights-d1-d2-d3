import { buildD2DownloadFilename, buildD2ReportS3Key } from './d2-report-key.util';

describe('d2-report-key.util', () => {
  it('builds S3 key aligned with Lambda D-2', () => {
    expect(buildD2ReportS3Key('2022-01-03', '2022-01-02')).toBe(
      'relatorios/D2/relatorio_D2_exec2022-01-03_dado2022-01-02.xlsx',
    );
  });

  it('builds friendly download filename', () => {
    expect(buildD2DownloadFilename('2022-01-03', '2022-01-02')).toBe(
      'relatorio_D2_exec2022-01-03_dado2022-01-02.xlsx',
    );
  });
});
