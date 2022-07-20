import Bottleneck from 'bottleneck'

class Queue {
  private limiter: Bottleneck
  constructor() {
    this.limiter = new Bottleneck({
      reservoir: 50,
      reservoirRefreshAmount: 50,
      reservoirRefreshInterval: 1 * 60 * 1000, // the 'per minute', must be divisible by 250
      maxConcurrent: 50,
    })
  }

  // When adding to the queue use this method, takes in a promise. Read the documentation of 'bottleneck' if you want to use async/await or callbacks instead.
  add(promise: any) {
    return this.limiter.schedule(promise)
  }
}

export const CoingeckoQueue = new Queue()
