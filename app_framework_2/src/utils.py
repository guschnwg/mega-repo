from typing import get_origin, get_args


def get_raw_types(the_type):
    the_args = get_args(the_type)
    the_args = [the_type] if len(the_args) in [0, 1] else the_args
    the_args = [a for a in the_args if a is not type(None)]
    return [get_origin(a) or a for a in the_args]

assert get_raw_types(bool) == [bool]
assert get_raw_types(list[bool]) == [list]
assert get_raw_types(list[bool] | None) == [list]
assert get_raw_types(list) == [list]
assert get_raw_types(list | None) == [list]

# from fastmcp.server.auth.oauth_proxy import OAuthProxy
# from mcp.shared.auth import OAuthClientInformationFull, OAuthToken
# from mcp.server.auth.provider import RefreshToken
# from mcp.server.auth.middleware.auth_context import auth_context_var
# from mcp.server.auth.middleware.bearer_auth import AuthenticatedUser

# og_exchange_token = OAuthProxy.exchange_refresh_token
# async def exchange_refresh_token(
#     self,
#     client: OAuthClientInformationFull,
#     refresh_token: RefreshToken,
#     scopes: list[str],
# ) -> OAuthToken:
#     token = await og_exchange_token(self,client, refresh_token, scopes)
#     print(f"Setting auth_context_var with {token}")
#     auth_context_var.set(AuthenticatedUser(self._access_tokens[token.access_token]))
#     return token
# OAuthProxy.exchange_refresh_token = exchange_refresh_token