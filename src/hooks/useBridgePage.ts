// import useWeb3React from './useWeb3'
// import { BRIDGE_ADDRESS } from 'constants/addresses'

export interface IClaim {
  amount: string
  fromChain: string
  toChain: string
  tokenId: string
  txId: string
  user: string
}

export function getClaimTokens(): IClaim[] {
  // const { chainId, account } = useWeb3React()
  const claim: IClaim = {
    amount: '1000',
    fromChain: '1',
    toChain: '250',
    tokenId: '0',
    txId: '2',
    user: '0x',
  }
  const claims = [claim]
  //   const networks = []
  //   for (let index = 0; index < networks.length; index++) {
  //     const chainId = networks[index]
  //     const dest = networks.filter((network) => network !== chainId)
  //     const userTxs = []
  //     const userTxsResponse = []
  //     const pendingClaimTxs = []
  //     let currentBlockNo = 0
  //     try {
  //       currentBlockNo = await web3s[chainId].eth.getBlockNumber()
  //     } catch (error) {
  //       console.log('getBlockNumber error', error)
  //     }
  //     for (let i = 0; i < dest.length; i++) {
  //       const destChainId = dest[i]
  //       const userTx = {
  //         address: BRIDGE_ADDRESS[chainId],
  //         name: 'getUserTxs',
  //         params: [account, destChainId],
  //       }
  //       userTxs.push(userTx)
  //     }
  //     try {
  //       const mul = await multicall(web3s[chainId], BridgeABI, userTxs, chainId)
  //       userTxsResponse = mul
  //       // console.log("userTxsResponse", userTxsResponse);
  //     } catch (error) {
  //       console.log('getUserTxs failed with chainId', chainId, error)
  //     }
  //     for (let i = 0; i < dest.length; i++) {
  //       const destChainId = dest[i]
  //       try {
  //         const pendingTx = await getBridgeContract(web3s[destChainId], destChainId)
  //           .methods.pendingTxs(
  //             chainId,
  //             userTxsResponse[i][0].map((resp) => resp.toString())
  //           )
  //           .call()
  //         const pendingTxs = pendingTx.reduce(
  //           (out, bool, index) => (bool ? out : out.concat(userTxsResponse[i][0][index])),
  //           []
  //         )
  //         pendingClaimTxs = [...pendingClaimTxs, ...pendingTxs]
  //       } catch (error) {
  //         console.log('pendingTxs failed with chainId', destChainId, error)
  //       }
  //     }
  //     const Txs = []
  //     for (let k = 0; k < pendingClaimTxs.length; k++) {
  //       const tx = {
  //         address: BRIDGE_ADDRESS[chainId],
  //         name: 'getTransaction',
  //         params: [pendingClaimTxs[k]],
  //       }
  //       Txs.push(tx)
  //     }
  //     try {
  //       const mul = await multicall(web3s[chainId], BridgeABI, Txs, chainId)
  //       let mulWithClaimBlock = []
  //       forEach(mul, (res, index) => {
  //         mulWithClaimBlock.push({
  //           ...res,
  //           remainingBlock: Number(res.txBlockNo) + blockTimes[chainId] - Number(currentBlockNo),
  //         })
  //         // console.log(res.txBlockNo.toString(), currentBlockNo, blockTimes[chainId]);
  //         // console.log(Number(res.txBlockNo) + blockTimes[chainId] - Number(currentBlockNo));
  //       })
  //       // console.log("Txs = ", mul);
  //       claims = [...claims, ...mulWithClaimBlock]
  //     } catch (error) {
  //       console.log('Txs failed chainId ', chainId, error)
  //     }
  //   }
  return claims
}
