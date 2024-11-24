import { Cron } from "croner";
import debug from "debug";

export abstract class BaseScheduler {
  protected cron: Cron | null = null;
  protected readonly debugger: debug.Debugger;

  constructor(name: string) {
    this.debugger = debug(`scheduler:${name}`);
  }

  protected abstract execute(): Promise<void>;

  public start(schedule: string | Date, runOnStart = false) {
    if (this.cron) {
      this.debugger("Scheduler already running");
      return;
    }

    this.cron = new Cron(
      schedule,
      async () => {
        try {
          this.debugger("Starting execution");
          await this.execute();
          this.debugger("Execution completed");
        } catch (error) {
          this.debugger("Execution failed:", error);
        }
      },
      {
        protect: true,
        timezone: "America/Los_Angeles",
      },
    );

    if (runOnStart) {
      this.cron.trigger();
    }
  }

  public stop() {
    if (this.cron) {
      this.cron.stop();
      this.cron = null;
      this.debugger("Scheduler stopped");
    }
  }
}
