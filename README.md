# Deno Panic Bug branch

With the changes in this branch a deno panic was caused (bug in deno).
The `reproduce_panic.ts` script reliably reproduces the panic.

As of writing this, the latest version of deno is 2.7.14.
The panic bug was reported in issue [#33713](https://github.com/denoland/deno/issues/33713), where the cause was spawning a sandbox, which caused the same tls request abortion.

The bug was fixed in pr [#33737](https://github.com/denoland/deno/pull/33737/commits), which as of now was merged after the latest release.

Upgrading to deno canary with `deno upgrade --canary` confirms the bug is resolved now.

The reproduce script was created with the intention of reporting the bug upstream as requested by the panic message, however since there already is an issue and it has been fixed, this is not necessary.

Nonetheless, this is an interesting bug discovery.

Reproduction steps:

```
# Ensure deno version is <= 2.7.14
deno --version

# Run the reproduce script
deno run -A reproduce_panic.ts
```

Example output:
```log
$ deno run -A reproduce_panic.ts 
1. Initializing MsEdgeTTS...
2. Setting metadata and connecting...
3. Requesting audio stream...
4. Force closing the WebSocket (simulating client abort)...

============================================================
Deno has panicked. This is a bug in Deno. Please report this
at https://github.com/denoland/deno/issues/new.
If you can reliably reproduce this panic, include the
reproduction steps and re-run with the RUST_BACKTRACE=1 env
var set and include the backtrace in your report.

Platform: linux x86_64
Version: 2.7.14
Args: ["deno", "run", "-A", "reproduce_panic.ts"]

View stack trace at:
https://panic.deno.com/v2.7.14/x86_64-unknown-linux-gnu/0ht4hHoy290Egm290Egl290Egj290Eg9690Egpqg1Egzgg1Egz0_sFg-zwsFg9zwsFA

thread 'main' (2265) panicked at ext/node/ops/tls_wrap.rs:2000:31:
called `Option::unwrap()` on a `None` value
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```
