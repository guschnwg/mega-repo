from flask import Flask
from redis import Redis
import os
import threading

# Add and initialize Datadog monitoring.
from datadog import initialize, statsd
initialize(statsd_host=os.environ.get('DATADOG_HOST'))


from ddtrace import patch, tracer

patch(logging=True)

import logging


FORMAT = ('%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] '
          '[dd.service=%(dd.service)s dd.env=%(dd.env)s dd.version=%(dd.version)s dd.trace_id=%(dd.trace_id)s dd.span_id=%(dd.span_id)s] '
          '- %(message)s')
logging.basicConfig(format=FORMAT)
log = logging.getLogger(__name__)
log.level = logging.INFO

class RequestDataFilter(logging.Filter):
    """
    This is a filter which injects contextual information into the log.
    """

    def filter(self, record):
        record.my_test = "oi"
        return True

for handler in log.handlers:
    handler.addFilter(RequestDataFilter())


app = Flask(__name__)
redis = Redis(host='redis', port=6379)

@tracer.wrap(name='my_resource1')
@app.route('/')
def hello():
    # Increment the Datadog counter.
    statsd.increment('docker_compose_example.page.views')

    redis.incr('hits')

    log.info('function1 has executed',
        extra={
            'job_category': 'test_function',
            'logger.name': 'my_json',
            'logger.thread_name' : threading.currentThread().name
        }
    )

    return 'Hello World! I have been seen %s times.' % redis.get('hits')

@app.route('/two')
def two():
    # Increment the Datadog counter.
    statsd.increment('docker_compose_example.page.views')

    redis.incr('hits')

    log.info('function1 has executed',
        extra={
            'job_category': 'test_function',
            'logger.name': 'my_json',
            'logger.thread_name' : threading.currentThread().name
        }
    )

    return 'Hello World! I have been seen %s times.' % redis.get('hits')

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
