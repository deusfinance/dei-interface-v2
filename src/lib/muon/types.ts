export interface IError {
  success: false
  error: string
}

export interface MuonResponse {
  success: boolean
  error?: string
  result: {
    app: string
    cid: string
    confirmed: boolean
    confirmedAt: number
    startedAt: number
    _id: string
    method: string
    nSign: number
    owner: string
    peerId: string
    data: {
      timestamp: number
      init: {
        none: string
        nonceAddress: string
        party: string
      }
      params: any
      result: any
    }
    signatures: {
      signature: string
      timestamp: number
      owner: string
      ownerPubKey: {
        x: string
        yParity: string
      }
      result: any
    }[]
  }
}
