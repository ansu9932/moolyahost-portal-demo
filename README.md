# MoolyaHost portal demo

[Open the interactive demo](https://ansu9932.github.io/moolyahost-portal-demo/) · [MoolyaHost website](https://moolyaindiapvtltd.com/)

This prototype demonstrates VPS provisioning and management workflows for MoolyaHost, the hosting service from Moolya India Private Limited.

- Choose a hostname, an operating system, and an NVMe plan to provision a simulated server.
- Start, stop, and restart simulated instances and review recent operations in the activity log.
- Keep workspace changes in browser storage or reset to the sample servers.

The prototype runs entirely in the browser. Server operations are simulated and there are no server API calls, cloud credentials, accounts, or charges. The demo source does not provide production provisioning or billing.

## Run locally

Serve the repository directory over HTTP and open the URL printed by the server. For example:

```sh
python3 -m http.server 8000
```
