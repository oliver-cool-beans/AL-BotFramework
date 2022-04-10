const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

function logger(){
    return winston.createLogger({
        level: 'info',
        transports: [
          new winston.transports.Console(),
          // Add Stackdriver Logging
          //loggingWinston,
        ],
      });
}

module.exports = logger;