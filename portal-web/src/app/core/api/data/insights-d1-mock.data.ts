import {
  aggregateD1FromEnriquecidoRows,
  mapEnriquecidoRowToInput,
} from '../d1-aggregate.util';
import { addOneDayIso } from '../d1-date.util';
import { buildD1DownloadFilename, buildD1ReportS3Key } from '../d1-report-key.util';
import {
  InsightsD1DownloadResponse,
  InsightsD1Response,
} from '../models/insights-d1.model';
import {
  getMockEnriquecidoRows,
  isMockEnriquecidoDt,
  MOCK_ENRIQUECIDO_PARTITIONS,
} from './enriquecido-mock.data';

export function listMockD1Partitions(): string[] {
  return [...MOCK_ENRIQUECIDO_PARTITIONS.partitions];
}

export function buildMockInsightsD1(dt: string): InsightsD1Response {
  const normalized = dt.trim().slice(0, 10);

  if (!isMockEnriquecidoDt(normalized)) {
    return aggregateD1FromEnriquecidoRows([], normalized, false);
  }

  const rows = getMockEnriquecidoRows(normalized).map(mapEnriquecidoRowToInput);
  return aggregateD1FromEnriquecidoRows(rows, normalized, true);
}

export function buildMockInsightsD1Download(dt: string): InsightsD1DownloadResponse {
  const normalized = dt.trim().slice(0, 10);
  const dataExecucao = addOneDayIso(normalized);

  return {
    presigned_url: '',
    expires_in_seconds: 900,
    s3_key: buildD1ReportS3Key(dataExecucao, normalized),
    filename: buildD1DownloadFilename(dataExecucao, normalized),
  };
}
