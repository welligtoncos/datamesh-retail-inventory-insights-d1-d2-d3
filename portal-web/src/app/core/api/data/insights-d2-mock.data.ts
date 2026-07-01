import {
  filterRupturasFromRows,
  mapEnriquecidoRowToRupturaInput,
} from '../d2-filter.util';
import { InsightsD2Response } from '../models/insights-d2.model';
import { getMockEnriquecidoRows, isMockEnriquecidoDt } from './enriquecido-mock.data';
import { addOneDayIso } from '../d1-date.util';
import { buildD2DownloadFilename, buildD2ReportS3Key } from '../d2-report-key.util';
import { InsightsDownloadResponse } from '../models/insights-shared.model';

export function buildMockInsightsD2(dt: string): InsightsD2Response {
  const normalized = dt.trim().slice(0, 10);

  if (!isMockEnriquecidoDt(normalized)) {
    return filterRupturasFromRows([], normalized, false);
  }

  const inputs = getMockEnriquecidoRows(normalized).map(mapEnriquecidoRowToRupturaInput);
  return filterRupturasFromRows(inputs, normalized, true);
}

export function buildMockInsightsD2Download(dt: string): InsightsDownloadResponse {
  const normalized = dt.trim().slice(0, 10);
  const dataExecucao = addOneDayIso(normalized);

  return {
    presigned_url: '',
    expires_in_seconds: 900,
    s3_key: buildD2ReportS3Key(dataExecucao, normalized),
    filename: buildD2DownloadFilename(dataExecucao, normalized),
  };
}
