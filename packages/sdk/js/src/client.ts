export * from "./gen/types.gen.js"
export { type Config as SgptcoderClientConfig, SgptcoderClient }

import { createClient } from "./gen/client/client.gen.js"
import { type Config } from "./gen/client/types.gen.js"
import { SgptcoderClient } from "./gen/sdk.gen.js"

export function createSgptcoderClient(config?: Config) {
  const client = createClient(config)
  return new SgptcoderClient({ client })
}
