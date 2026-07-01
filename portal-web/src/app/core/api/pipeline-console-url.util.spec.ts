import { buildSfnConsoleUrl } from './pipeline-console-url.util';

describe('pipeline-console-url.util', () => {
  it('builds AWS console URL for execution arn', () => {
    const arn =
      'arn:aws:states:us-east-1:303238378103:stateMachine:retail-inventory-insights-processar-dia-dev:execution:mock-1';
    const url = buildSfnConsoleUrl(arn);
    expect(url).toContain('console.aws.amazon.com/states');
    expect(url).toContain(encodeURIComponent(arn));
  });
});
