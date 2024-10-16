For some reason the `client` in Docker in MacOS ARM does not connect to the STUN google server.
For that, run `make client` and it should work.

I was able to get it working in MacOS x64.

TODO

- Need to figure out why there is no video in iOS Safari/Chrome
- The JSClient works fine inside Docker for Mac ARM after some given time, but we need to retry many times.
- Make it prettier
- Make a disconnect method
- Add name