import { computeDurationSeconds } from './pipeline-duration.util';

describe('pipeline-duration.util', () => {
  it('computes duration in seconds', () => {
    expect(computeDurationSeconds('2022-01-01T10:00:00.000Z', '2022-01-01T10:01:40.000Z')).toBe(
      100,
    );
  });

  it('returns null when stopped_at is missing', () => {
    expect(computeDurationSeconds('2022-01-01T10:00:00.000Z', null)).toBeNull();
  });

  it('property: duration is non-negative', () => {
    const started = '2022-01-01T10:00:00.000Z';
    const stopped = '2022-01-01T10:05:00.000Z';
    const duration = computeDurationSeconds(started, stopped);
    expect(duration).not.toBeNull();
    expect(duration!).toBeGreaterThanOrEqual(0);
  });
});
