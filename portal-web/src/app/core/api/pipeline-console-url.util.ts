export function buildSfnConsoleUrl(executionArn: string, region = 'us-east-1'): string {
  const encoded = encodeURIComponent(executionArn);
  return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/v2/executions/details/${encoded}`;
}
