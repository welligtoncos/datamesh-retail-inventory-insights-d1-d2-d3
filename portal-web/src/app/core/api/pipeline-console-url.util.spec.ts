import {
  buildSfnConsoleUrl,
  buildSfnExecutionArn,
  canOpenSfnConsoleUrl,
  isMockPipelineExecutionArn,
  PROCESSAR_DIA_SFN_ARN,
  resolveSfnConsoleUrl,
} from './pipeline-console-url.util';

describe('pipeline-console-url.util', () => {
  const mockArn = buildSfnExecutionArn(PROCESSAR_DIA_SFN_ARN, 'mock-exec-002');
  const realArn = buildSfnExecutionArn(
    PROCESSAR_DIA_SFN_ARN,
    'a1b2c3d4-5678-90ab-cdef-EXAMPLE11111',
  );

  it('builds valid execution ARN from state machine ARN', () => {
    const arn = buildSfnExecutionArn(PROCESSAR_DIA_SFN_ARN, 'mock-exec-001');
    expect(arn).toBe(
      'arn:aws:states:us-east-1:303238378103:execution:retail-inventory-insights-processar-dia-dev:mock-exec-001',
    );
    expect(arn).not.toContain(':stateMachine:');
  });

  it('detects mock execution ARNs', () => {
    expect(isMockPipelineExecutionArn(mockArn)).toBe(true);
    expect(isMockPipelineExecutionArn(realArn)).toBe(false);
  });

  it('blocks console URL for mock executions', () => {
    expect(canOpenSfnConsoleUrl(mockArn)).toBe(false);
    expect(resolveSfnConsoleUrl(mockArn)).toBeNull();
  });

  it('allows console URL for real execution ARNs', () => {
    expect(canOpenSfnConsoleUrl(realArn)).toBe(true);
    const url = resolveSfnConsoleUrl(realArn);
    expect(url).toContain('console.aws.amazon.com/states');
    expect(url).toContain(encodeURIComponent(realArn));
  });

  it('builds AWS console URL for execution arn', () => {
    const arn = buildSfnExecutionArn(PROCESSAR_DIA_SFN_ARN, 'mock-1');
    const url = buildSfnConsoleUrl(arn);
    expect(url).toContain('console.aws.amazon.com/states');
    expect(url).toContain(encodeURIComponent(arn));
  });
});
