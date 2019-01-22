import os from 'os';
import Hapi from 'hapi';
import Joi from 'joi';
import Boom from 'boom';
import good from 'good';
import humanize from 'humanize';
import httpStatus from 'http-status-codes';
import {isNumber} from 'lodash';

const allStatusCodes = Object.keys(httpStatus)
  .map(code => httpStatus[code])
  .filter(isNumber);

const port = process.env.PORT || 5000;

const server = new Hapi.Server({
  host: '0.0.0.0',
  port
});

async function start() {
  await server.register({
    plugin: good,
    options: {
      ops: {
        interval: 1000
      },
      reporters: {
        logs: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [
              {
                log: '*',
                response: {
                  include: 'api',
                  exclude: 'health'
                }
              }
            ]
          },
          {
            module: 'good-console'
          },
          'stdout'
        ],
        errors: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{error: '*'}]
          },
          {
            module: 'good-console'
          },
          'stderr'
        ]
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    options: {
      description: 'Basic default route that returns a JSON object',
      tags: ['api'],
      handler: () => ({
        host: os.hostname(),
        at: new Date().toUTCString()
      })
    }
  });

  server.route({
    method: 'GET',
    path: '/details',
    options: {
      description: 'Details route that returns details of the host',
      tags: ['api'],
      handler: () => ({
        hostname: os.hostname(),
        arch: os.arch(),
        platfoirm: os.platform(),
        cpus: os.cpus().length,
        totalmem: humanize.filesize(os.totalmem()),
        networkInterfaces: os.networkInterfaces()
      })
    }
  });

  server.route({
    method: 'GET',
    path: '/status/{code}',
    options: {
      description: 'Route which echos back the status code as an error object',
      tags: ['api'],
      validate: {
        params: {
          code: Joi.number()
            .integer()
            .positive()
            .required()
            .allow(allStatusCodes)
        }
      },
      handler: (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
        const statusCode = parseInt(req.params.code);
        if (statusCode >= 400) {
          return Boom.boomify(new Error(`Forced status code: ${statusCode}`), {
            statusCode
          });
        }

        return h
          .response({statusCode, message: httpStatus.getStatusText(statusCode)})
          .code(statusCode);
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/status',
    options: {
      description: 'Simple status route that returns a 200 (OK)',
      tags: ['api', 'health'],
      handler: () => ({
        status: 'ok'
      })
    }
  });

  server.route({
    method: ['PUT', 'POST'],
    path: '/echo',
    options: {
      description: 'Echos back the JSON payload sent to the handler',
      tags: ['api'],
      payload: {
        parse: true
      },
      handler: (req: Hapi.Request) => req.payload
    }
  });

  await server.start();
  console.log(`Listening on port ${port}.`);
}

async function shutdown() {
  console.log('Gracefully shutting down...');
  await server.stop();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
