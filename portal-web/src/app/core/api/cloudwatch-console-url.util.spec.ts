import { buildCloudWatchAlarmConsoleUrl } from './cloudwatch-console-url.util';
import { PRIMARY_SFN_ALARM_NAME } from './models/ops-alarms.model';

describe('cloudwatch-console-url.util', () => {
  it('builds AWS console URL for alarm name', () => {
    const url = buildCloudWatchAlarmConsoleUrl(PRIMARY_SFN_ALARM_NAME);
    expect(url).toContain('console.aws.amazon.com/cloudwatch');
    expect(url).toContain(encodeURIComponent(PRIMARY_SFN_ALARM_NAME));
    expect(url).toContain('us-east-1');
  });
});
