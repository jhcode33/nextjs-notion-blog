import Keyv from '@keyvhq/core'
import KeyvRedis from '@keyvhq/redis'

import { isRedisEnabled, redisNamespace, redisUrl } from './config'

let db: Keyv
if (isRedisEnabled) {
  const keyvRedis = new KeyvRedis(redisUrl, {
    // Redis 연결 안정성 옵션
    maxRetriesPerRequest: 50, // 최대 50회 재시도 후 실패 반환
    retryStrategy: (times) => Math.min(times * 100, 2000), // 재시도 간격: 100ms -> 200ms -> … 최대 2초
    connectTimeout: 5000, // 연결 시도 최대 5초
    enableOfflineQueue: true // Redis 연결이 끊겨도 큐에 쌓아두고 복구 시 처리
  });

  db = new Keyv({ store: keyvRedis, namespace: redisNamespace || undefined })
} else {
  db = new Keyv()
}

export { db }
