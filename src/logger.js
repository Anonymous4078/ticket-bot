const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      level: 'error',
      colorize: true,
      customColors: 'error:red,info:blue,warn:yellow',
      useOnlyCustomProps: true,
      ignore: 'pid,hostname',
      timestampKey: 'time',
      translateTime: 'dddd, mmmm dS, yyyy, h:MM:ss TT',
    },
  },
});

module.exports = logger;
