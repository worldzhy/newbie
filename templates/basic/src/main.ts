import { NewbieFactory } from "@devbie/newbie";
import { ApplicationModule } from "@/application/application.module";

async function bootstrap(): Promise<void> {
  // NewbieFactory auto-starts the built-in reporters after the HTTP server is
  // accepting traffic, fully env-gated so an unconfigured project is a no-op:
  //  - module-hub when MODULE_HUB_ENDPOINT + MODULE_HUB_TOKEN are set
  //  - health snapshots when HEALTH_ENDPOINT + HEALTH_TOKEN
  //    are set (dependency auto-detection runs against the DI container)
  await NewbieFactory.create(ApplicationModule);
}

void bootstrap();
