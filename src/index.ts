import os from 'os';
import Hapi from 'hapi';
import Joi from 'joi';
import Boom from 'boom';
import good from 'good';
import humanize from 'humanize';

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
                  include: '*'
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
      validate: {
        params: {
          code: Joi.number()
            .integer()
            .positive()
            .required()
        }
      },
      handler: (req: Hapi.Request) => {
        const statusCode = parseInt(req.params.code);
        return Boom.boomify(new Error(`Forced status code: ${statusCode}`), {
          statusCode
        });
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/status',
    options: {
      description: 'Simple status route that returns a 200 (OK)',
      handler: () => ({
        status: 'ok'
      })
    }
  });

  await server.start();
  console.log(`Listening on port ${port}.`);
}

start();
