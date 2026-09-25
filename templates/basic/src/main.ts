import {startHeartbeat} from '@devbie/nightwatch-heartbeat-sdk';
import {NewbieFactory} from '@devbie/newbie';
import {ApplicationModule} from '@/application/application.module';

async function bootstrap(): Promise<void> {
  // Start reporting liveness only after the HTTP server is accepting traffic.
  await NewbieFactory.create(ApplicationModule);

  // Enrolled projects set the two NIGHTWATCH_* vars; otherwise this is a no-op.
  const endpoint = process.env.NIGHTWATCH_REPORT_ENDPOINT;
  const token = process.env.NIGHTWATCH_APPLICATION_TOKEN;
  if (endpoint && token) {
    startHeartbeat({endpoint, token});
  }
}

void bootstrap();
