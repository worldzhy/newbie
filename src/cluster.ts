import {Injectable} from '@nestjs/common';
const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      console.log(`MASTER SERVER IS RUNNING`);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('online', (worker, code, signal) => {
        console.log(`WORKER SERVER ${worker.id} IS ONLINE`);
      });

      cluster.on('exit', (worker, code, signal) => {
        console.log(`WORKER SERVER ${worker.id} EXITED`);
        cluster.fork();
      });
    } else {
      callback();
    }
  }
}
