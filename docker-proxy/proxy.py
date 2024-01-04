from mitmproxy import http
from mitmproxy import ctx

class Interceptor:
    def request(self, flow: http.HTTPFlow) -> None:
        ctx.log.info(flow.request.pretty_url)
        flow.response = http.Response.make(200, "HI from request")

    def response(self, flow: http.HTTPFlow) -> None:
        ctx.log.info(flow.response.content)
        flow.response.text = "HI from response"

addons = [Interceptor()]