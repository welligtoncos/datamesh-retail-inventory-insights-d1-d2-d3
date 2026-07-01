import { addOneDayIso, defaultD1Dt, yesterdayIso } from './d1-date.util';
import { MOCK_ENRIQ_DT_A, MOCK_ENRIQ_DT_B } from './data/enriquecido-mock.data';

describe('d1-date.util', () => {
  it('adds one day for data_execucao semantics', () => {
    expect(addOneDayIso('2022-01-01')).toBe('2022-01-02');
  });

  it('computes yesterday', () => {
    expect(yesterdayIso('2022-01-02')).toBe('2022-01-01');
  });

  it('defaults to yesterday partition when available', () => {
    const partitions = [MOCK_ENRIQ_DT_B, MOCK_ENRIQ_DT_A];
    expect(defaultD1Dt(partitions, MOCK_ENRIQ_DT_B)).toBe(MOCK_ENRIQ_DT_A);
  });
});
