export const PROCESSAR_DIA_SFN_ARN =
  'arn:aws:states:us-east-1:303238378103:stateMachine:retail-inventory-insights-processar-dia-dev';

const MOCK_EXECUTION_NAME_PREFIX = 'mock-exec-';

/** Converts a state machine ARN into a valid Step Functions execution ARN. */
export function buildSfnExecutionArn(
  stateMachineArn: string,
  executionName: string,
): string {
  const executionBase = stateMachineArn.replace(':stateMachine:', ':execution:');
  return `${executionBase}:${executionName}`;
}

export function isMockPipelineExecutionArn(executionArn: string): boolean {
  const executionName = executionArn.trim().split(':').pop() ?? '';
  return executionName.startsWith(MOCK_EXECUTION_NAME_PREFIX);
}

/** True only for real SFN execution ARNs (not portal mock/demo). */
export function canOpenSfnConsoleUrl(executionArn: string | null | undefined): boolean {
  const arn = executionArn?.trim();
  if (!arn || isMockPipelineExecutionArn(arn)) {
    return false;
  }
  return /^arn:aws:states:[^:]+:\d+:execution:[^:]+:[^:]+$/.test(arn);
}

export function resolveSfnConsoleUrl(executionArn: string | null | undefined): string | null {
  if (!canOpenSfnConsoleUrl(executionArn)) {
    return null;
  }
  return buildSfnConsoleUrl(executionArn!.trim());
}

export function buildSfnConsoleUrl(executionArn: string, region = 'us-east-1'): string {
  const encoded = encodeURIComponent(executionArn);
  return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/v2/executions/details/${encoded}`;
}

