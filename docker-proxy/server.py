import urllib.request
import ssl
import requests

import logging

logger = logging.getLogger()
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)

logger.info("requests")

logger.info("> HTTP")
logger.info(requests.get("http://netflix.com").content)

logger.info("> HTTPS without verify")
logger.info(requests.get("https://netflix.com", verify=False).content)

logger.info("> HTTPS verifying")
logger.info(requests.get("https://netflix.com").content)

logger.info("urllib")

logger.info("> HTTP")
logger.info(urllib.request.urlopen("http://netflix.com").read())

logger.info("> HTTPS without verify")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
logger.info(urllib.request.urlopen("https://netflix.com", context=ctx).read())

logger.info("> HTTPS verifying")
ctx = ssl.create_default_context()
ctx.load_verify_locations("/root/.mitmproxy/mitmproxy-ca-cert.pem")
logger.info(urllib.request.urlopen("https://netflix.com", context=ctx).read())