import { formatEther } from '@ethersproject/units'
import { getApolloClient } from 'apollo/client/vdeus'
import { Voucher, VOUCHER_DETAILS } from 'apollo/queries'
import Loader from 'components/Icons/Loader'
import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { VDEUS_USDC_FACTOR } from 'hooks/useVDeusStats'
import useWeb3React from 'hooks/useWeb3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useModalOpen, useVoucherModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import styled from 'styled-components'
import { formatDollarAmount } from 'utils/numbers'
import { adjustedDeusPerDei } from './DeusStats'

const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 1rem;
`};

  > div {
    margin: 4px 0px;
  }
`

const ModalInfoWrapper = styled(RowBetween)`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 250px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      padding: 0.75rem 1rem;
      width: 90%;
      min-width: 265px;
    `}
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

export const DEFAULT_VOUCHER: Voucher = {
  amount: '',
  currentTokenId: '',
  totalBurned: '',
  y: '',
  usdcRedeemed: '',
  deusRedeemable: '',
  timestamp: '',
}

export default function VoucherModal({ voucherId }: { voucherId: number | undefined }) {
  const { chainId } = useWeb3React()

  const voucherModalOpen = useModalOpen(ApplicationModal.VOUCHER)
  const toggleVoucherModal = useVoucherModalToggle()

  const [voucher, setVoucher] = useState<Voucher | null>(null)

  const fetchVoucher = useCallback(async () => {
    const DEFAULT_RETURN: Voucher | null = null
    try {
      const client = getApolloClient(chainId ?? FALLBACK_CHAIN_ID)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: VOUCHER_DETAILS,
        variables: { currentTokenId: Number(voucherId) },
        fetchPolicy: 'no-cache',
      })

      return data.redeems[0] as Voucher
    } catch (error) {
      console.log('Unable to fetch voucher details from The Graph Network')
      console.error(error)
      return null
    }
  }, [chainId, voucherId])

  useEffect(() => {
    const getVoucher = async () => {
      const result = await fetchVoucher()
      setVoucher(result)
    }
    getVoucher()
  }, [fetchVoucher])

  const {
    deiBurned = null,
    usdcRedeemed = null,
    deusRedeemable = null,
  } = useMemo(() => {
    return {
      deiBurned: Number(formatEther(voucher?.amount || '0')), // dei burned to get the voucher
      usdcRedeemed: Number(formatEther(voucher?.amount || '0')) * parseFloat(voucher?.y || '0'),
      deusRedeemable:
        Number(formatEther(voucher?.amount || '0')) *
        adjustedDeusPerDei(parseFloat(voucher?.y || '0') * VDEUS_USDC_FACTOR, voucher?.currentTokenId || '-1'),
    }
  }, [voucher])

  const { burnBracket, cliffPeriod, vestingPeriod } = useMemo(() => {
    if (voucher === null)
      return {
        burnBracket: null,
        cliffPeriod: null,
        vestingPeriod: null,
      }
    const parsedBurn = Number(formatEther(voucher?.totalBurned || '0'))
    if (parsedBurn > 40000000)
      // above 40M
      return {
        burnBracket: 'Above 40M',
        cliffPeriod: '4 Months',
        vestingPeriod: '6 Months',
      }
    if (parsedBurn > 30000000)
      // between 30M - 40M
      return {
        burnBracket: 'Between 30M - 40M',
        cliffPeriod: '3 Months',
        vestingPeriod: '4 Months',
      }
    if (parsedBurn > 15000000)
      // between 15M - 30M
      return {
        burnBracket: 'Between 15M - 30M',
        cliffPeriod: '2.5 Months',
        vestingPeriod: '2 Months',
      }
    if (parsedBurn > 5000000)
      // between 5M - 15M
      return {
        burnBracket: 'Between 5M - 15M',
        cliffPeriod: '2 Months',
        vestingPeriod: '2 Months',
      }
    if (parsedBurn > 0)
      // between 0 - 5M
      return {
        burnBracket: 'Between 0 - 5M',
        cliffPeriod: '1 Month',
        vestingPeriod: '2 Months',
      }
    return {
      burnBracket: null,
      cliffPeriod: null,
      vestingPeriod: null,
    }
  }, [voucher])

  function getModalBody() {
    return (
      <ModalWrapper>
        <div>
          vDEUS NFT :{' '}
          <a
            href={`https://ftmscan.com/token/0x980c39133a1a4e83e41d652619adf8aa18b95c8b?a=${voucherId}`}
            target={'_blank'}
            rel={'noreferrer'}
          >
            FTMScan Link
          </a>
        </div>
        <ModalInfoWrapper>
          <p>DEI Burned</p>
          {deiBurned != null ? <ItemValue>{formatDollarAmount(deiBurned)}</ItemValue> : <Loader />}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <p>USDC Redeemed</p>
          {usdcRedeemed != null ? <ItemValue>{formatDollarAmount(usdcRedeemed)}</ItemValue> : <Loader />}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <p>DEUS to be redeemed</p>
          {deusRedeemable != null ? <ItemValue>{formatDollarAmount(deusRedeemable)}</ItemValue> : <Loader />}
        </ModalInfoWrapper>
        <div>Tranche Details: </div>
        <ModalInfoWrapper>
          <p>DEI Burned bracket</p>
          {burnBracket === null ? <Loader /> : <ItemValue>{burnBracket}</ItemValue>}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <p>vDEUS Cliff Period</p>
          {cliffPeriod === null ? <Loader /> : <ItemValue>{cliffPeriod}</ItemValue>}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <p>vDEUS Vesting Period</p>
          {vestingPeriod === null ? <Loader /> : <ItemValue>{vestingPeriod}</ItemValue>}
        </ModalInfoWrapper>
      </ModalWrapper>
    )
  }

  function getModalContent() {
    return (
      <>
        <ModalHeader title={`vDEUS Voucher #${voucherId}`} onClose={toggleVoucherModal} />
        {getModalBody()}
      </>
    )
  }

  return (
    <Modal
      width="500px"
      isOpen={voucherModalOpen}
      onBackgroundClick={toggleVoucherModal}
      onEscapeKeydown={toggleVoucherModal}
    >
      {getModalContent()}
    </Modal>
  )
}
