import {NewbieFactory} from '@devbie/newbie';
import {startHeartbeat} from '@devbie/heartbeat-sdk';
import {ApplicationModule} from '@/application/application.module';

async function bootstrap(): Promise<void> {
  // Start reporting liveness only after the HTTP server is accepting traffic.
  // NewbieFactory auto-starts the module-hub reporter when
  // MODULE_HUB_ENDPOINT + MODULE_HUB_TOKEN are set (no manual wiring needed).
  await NewbieFactory.create(ApplicationModule);

  // Heartbeat is an independent framework-agnostic SDK: enrolled projects set
  // the two HEARTBEAT_* vars; otherwise this is a no-op.
  const heartbeatEndpoint = process.env.HEARTBEAT_ENDPOINT;
  const heartbeatToken = process.env.HEARTBEAT_TOKEN;
  if (heartbeatEndpoint && heartbeatToken) {
    startHeartbeat({endpoint: heartbeatEndpoint, token: heartbeatToken});
  }
}

void bootstrap();
