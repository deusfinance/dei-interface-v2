import { MuonResponse, IError } from '../types'
import { Type, isError, getErrorMessage } from '../error'
import { MuonClient } from './base'
import { MUON_BASE_URL } from '../config'

export interface RequestParams {
  depositAddress: string
  depositTxId: string
  depositNetwork: number
}

interface ClaimData {
  success: true
  data: {
    response: MuonResponse
    calldata: {
      amount: string
      fromChain: string
      toChain: string
      tokenId: string
      txId: string
      user: string
      reqId: string
      timestamp: number
      sigs: {
        signature: string
        owner: string
        nonce: string
      }[]
    }
  }
}

export class BridgeClient extends MuonClient {
  constructor(baseURL?: string) {
    super({
      baseURL: baseURL ?? MUON_BASE_URL,
      nSign: 7,
      APP_ID: 'deus_bridge',
      APP_METHOD: 'claim',
    })
  }

  private _getRequestParams(depositAddress: string, depositTxId: string, depositNetwork: number): Type<RequestParams> {
    if (!depositAddress) return new Error('Param `depositAddress` is missing.')

    const address = this._getChecksumAddress(depositAddress)
    if (!address) return new Error('Param `depositAddress` is not a valid address.')

    return {
      depositAddress: address,
      depositTxId,
      depositNetwork,
    }
  }

  public async getClaimData(Claim: RequestParams): Promise<ClaimData | IError> {
    try {
      const requestParams = this._getRequestParams(Claim.depositAddress, Claim?.depositTxId, Claim?.depositNetwork)
      if (isError(requestParams)) throw new Error(requestParams.message)
      console.info('Requesting data from Muon: ', requestParams)

      const response = await this._makeRequest(requestParams)
      if (isError(response)) throw new Error(response.message)
      console.info('Response from Muon: ', response)

      if ('error' in response) {
        throw new Error(response.error)
      } else if (!response.success || !response.result.confirmed) {
        throw new Error('An unknown Muon error has occurred')
      }

      const result = response.result
      const reqId = `0x${result?.cid?.substring(1)}`
      const signature = result?.signatures[0]?.signature
      const owner = result?.signatures[0]?.owner
      const nonce = result?.data?.init?.nonceAddress
      const sigs = [
        {
          signature,
          owner,
          nonce,
        },
      ]

      return {
        success: true,
        data: {
          response,
          calldata: {
            amount: result?.data?.result?.amount,
            fromChain: result?.data?.result?.fromChain,
            toChain: result?.data?.result?.toChain,
            tokenId: result?.data?.result?.v,
            txId: result?.data?.result?.txId,
            user: result?.data?.result?.user,
            timestamp: result?.signatures[0]?.result?.timestamp,
            reqId,
            sigs,
          },
        },
      }
    } catch (err) {
      console.error(err)
      return {
        success: false,
        error: getErrorMessage(err),
      }
    }
  }
}
