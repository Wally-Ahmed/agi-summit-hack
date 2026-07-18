---
name: cloud-model-preference
description: "On the cloud Codespace, Claude Code must run Fable 5 at xhigh reasoning effort"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

Wally's standing instruction (2026-07-18): sessions on the cloud server (Codespace
`glowing-acorn-q79w9x4vj4wx3xrgj` for the [[project-definition]] build) must use **Fable 5 with
reasoning effort xhigh**. The Codespace's Claude Code is logged into a **different account** than
the Mac.

**Why:** the cloud box does the heavy build/benchmark work; Wally wants maximum model quality
there regardless of local settings.

**How to apply:** when configuring or advising on the Codespace, set model `claude-fable-5` +
xhigh effort (settings.json if supported, else `/model fable` + effort picker). Never assume the
Mac's model/account settings carry over. See [[standing-handoff]].
