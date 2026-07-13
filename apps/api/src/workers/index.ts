import { startRecurringTaskWorker, stopRecurringTaskWorker } from './recurring-task.worker.js';
import { startNotificationQueueWorker, stopNotificationQueueWorker } from './notification-queue.worker.js';

export function startWorkers(): void {
  console.log('👷 Starting background workers...');
  startRecurringTaskWorker();
  startNotificationQueueWorker();
}

export function stopWorkers(): void {
  console.log('⏹  Stopping background workers...');
  stopRecurringTaskWorker();
  stopNotificationQueueWorker();
}
