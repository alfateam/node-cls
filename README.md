_Continuation Local Storage based on async_hooks_
---------------
The purpose with this module is to share contexts across async (and sync) calls. Contexts are accessed by keys and can be nested. It is an alternative to the deprecated [domain](https://nodejs.org/docs/latest-v8.x/api/domain.html). It is based on [async_hooks](https://nodejs.org/docs/latest-v8.x/api/async_hooks.html) that were introduced in node 8. Beware that that the async_hooks are still experimental in nodejs.
__Usage__
---------------
A typical scenario is when you need to share context in a request handler.