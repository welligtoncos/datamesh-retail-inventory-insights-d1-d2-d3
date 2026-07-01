import { addOneDayIso } from '../d1-date.util';
import { buildD3DownloadFilename, buildD3ReportS3Key } from '../d3-report-key.util';
import {
  computeTrendsFromEnrichedRows,
  insightDateRange,
} from '../d3-trend.util';
import { InsightsD3Response } from '../models/insights-d3.model';
import { InsightsDownloadResponse } from '../models/insights-shared.model';
import { getMockEnriquecidoRows, isMockEnriquecidoDt } from './enriquecido-mock.data';

export function buildMockInsightsD3(dt: string, windowDays: number): InsightsD3Response {
  const normalized = dt.trim().slice(0, 10);

  if (!isMockEnriquecidoDt(normalized)) {
    return computeTrendsFromEnrichedRows([], normalized, windowDays, false);
  }

  const dates = insightDateRange(normalized, windowDays);
  const allRows: Record<string, unknown>[] = [];

  for (const date of dates) {
    if (isMockEnriquecidoDt(date)) {
      allRows.push(...getMockEnriquecidoRows(date));
    }
  }

  return computeTrendsFromEnrichedRows(allRows, normalized, windowDays, true);
}

export function buildMockInsightsD3Download(
  dt: string,
  _windowDays: number,
): InsightsDownloadResponse {
  const normalized = dt.trim().slice(0, 10);
  const dataExecucao = addOneDayIso(normalized);

  return {
    presigned_url: '',
    expires_in_seconds: 900,
    s3_key: buildD3ReportS3Key(dataExecucao, normalized),
    filename: buildD3DownloadFilename(dataExecucao, normalized),
  };
}
