import { buildD3DownloadFilename, buildD3ReportS3Key } from './d3-report-key.util';

describe('d3-report-key.util', () => {
  it('builds S3 key aligned with Lambda D-3', () => {
    expect(buildD3ReportS3Key('2022-01-03', '2022-01-02')).toBe(
      'relatorios/D3/relatorio_D3_exec2022-01-03_dado2022-01-02.xlsx',
    );
  });

  it('builds friendly download filename', () => {
    expect(buildD3DownloadFilename('2022-01-03', '2022-01-02')).toBe(
      'relatorio_D3_exec2022-01-03_dado2022-01-02.xlsx',
    );
  });
});
