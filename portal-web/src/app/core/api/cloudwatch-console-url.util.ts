export function buildCloudWatchAlarmConsoleUrl(
  alarmName: string,
  region = 'us-east-1',
): string {
  const encoded = encodeURIComponent(alarmName);
  return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/${encoded}`;
}
