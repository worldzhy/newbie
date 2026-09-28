import {NewbieFactory, startModuleHubReporting} from '@devbie/newbie';
import {startHeartbeat} from '@devbie/nightwatch-heartbeat-sdk';
import {ApplicationModule} from '@/application/application.module';

async function bootstrap(): Promise<void> {
  // Start reporting liveness only after the HTTP server is accepting traffic.
  await NewbieFactory.create(ApplicationModule);

  // Enrolled projects set the two NIGHTWATCH_* vars; otherwise this is a no-op.
  const heartbeatEndpoint = process.env.NIGHTWATCH_REPORT_ENDPOINT;
  const heartbeatToken = process.env.NIGHTWATCH_APPLICATION_TOKEN;
  if (heartbeatEndpoint && heartbeatToken) {
    startHeartbeat({endpoint: heartbeatEndpoint, token: heartbeatToken});
  }

  // Module-hub self-registration: projects enrolled with a module-hub host set
  // MODULE_HUB_ENDPOINT + MODULE_HUB_TOKEN. On startup the reporter sends a
  // full report (with the assembled-module snapshot), then pings every 60s.
  // Without both env vars this is a no-op.
  const hubEndpoint = process.env.MODULE_HUB_ENDPOINT;
  const hubToken = process.env.MODULE_HUB_TOKEN;
  if (hubEndpoint && hubToken) {
    startModuleHubReporting({endpoint: hubEndpoint, token: hubToken});
  }
}

void bootstrap();
