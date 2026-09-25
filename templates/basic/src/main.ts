import {NewbieFactory} from '@devbie/newbie';
import {ApplicationModule} from '@/application/application.module';
import {bootstrapHeartbeat} from '@/heartbeat';

async function bootstrap(): Promise<void> {
  // Start reporting liveness only after the HTTP server is accepting traffic.
  await NewbieFactory.create(ApplicationModule);
  bootstrapHeartbeat();
}

void bootstrap();
