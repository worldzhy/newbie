import {startHeartbeat} from '@devbie/nightwatch-heartbeat-sdk';
import {NewbieFactory} from '@devbie/newbie';
import {ApplicationModule} from '@/application/application.module';

async function bootstrap(): Promise<void> {
  // Start reporting liveness only after the HTTP server is accepting traffic.
  await NewbieFactory.create(ApplicationModule);

  // Enrolled projects set the three NIGHTWATCH_* vars; otherwise this is a no-op.
  const endpoint = process.env.NIGHTWATCH_REPORT_ENDPOINT;
  const applicationId = process.env.NIGHTWATCH_APPLICATION_ID;
  const token = process.env.NIGHTWATCH_APPLICATION_TOKEN;
  if (endpoint && applicationId && token) {
    startHeartbeat({endpoint, applicationId, token});
  }
}

void bootstrap();
