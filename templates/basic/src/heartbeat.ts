import {startHeartbeat} from '@devbie/heartbeat-sdk';

/**
 * Starts nightwatch liveness reporting when the monitoring env vars are
 * configured. Projects not enrolled in nightwatch leave the three vars
 * unset, in which case this is a silent no-op.
 */
export function bootstrapHeartbeat(): void {
  const endpoint = process.env.NIGHTWATCH_REPORT_ENDPOINT;
  const applicationId = process.env.NIGHTWATCH_APPLICATION_ID;
  const token = process.env.NIGHTWATCH_APPLICATION_TOKEN;

  if (!endpoint || !applicationId || !token) {
    return;
  }

  startHeartbeat({endpoint, applicationId, token});
}
