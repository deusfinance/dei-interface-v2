import styled from 'styled-components'
import Column from 'components/Column'
import { RowStart } from 'components/Row'
import { BN_TEN, formatBalance, toBN } from 'utils/numbers'

const MainTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
`
const Title = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.text2};
`
const Amount = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.yellow1};
`
function has(amount: string): boolean {
  return toBN(amount).abs().gt(0)
}

function toAmount(amount: string, decimals?: number, isAbs?: boolean): string {
  return formatBalance(
    isAbs
      ? toBN(amount).div(BN_TEN.pow(decimals || 18))
      : toBN(amount)
          .abs()
          .div(BN_TEN.pow(decimals || 18))
  )
}

function getDecimals(name: string, symbol: string) {
  if (name.indexOf('Thena') !== -1 || name.indexOf('archly-bnb') !== -1 || name.indexOf('archly-bnb') !== -1) {
    return 18
  }
  return symbol === 'USDC' || symbol === 'USDT' || symbol === 'USDP' ? 6 : 18
}

function getInfoDynamic(data: any, isAbs?: boolean) {
  return Object.keys(data)
    .filter((k) => has(data[k]))
    .map((v) => ({ title: v, amount: `${toAmount(data[v], getDecimals('', v), isAbs)}` }))
}

function getLPInfo(pairs: any) {
  const { al_t0, al_t1, lp_bh, lp_now, rl_t0, rl_t1, t0_bh, t0_now, t1_bh, t1_now, token0, token1, name } = pairs || {}
  return [
    {
      title: 'Balance before',
      amount: `${toAmount(lp_bh)} LP (${toAmount(t0_bh, getDecimals(name, token0))} ${token0} + ${toAmount(
        t1_bh,
        getDecimals(name, token1)
      )} ${token1})`,
    },
    {
      title: 'Balance now',
      amount: `${toAmount(lp_now)} LP (${toAmount(t0_now, getDecimals(name, token0))} ${token0} + ${toAmount(
        t1_now,
        getDecimals(name, token1)
      )} ${token1})`,
    },
    {
      title: 'Add liquidity',
      amount: `${toAmount(al_t0, getDecimals(name, token0))} ${token0} + ${toAmount(
        al_t1,
        getDecimals(name, token1)
      )} ${token1}`,
    },
    {
      title: 'Remove liquidity',
      amount: `${toAmount(rl_t0, getDecimals(name, token0))} ${token0} + ${toAmount(
        rl_t1,
        getDecimals(name, token1)
      )} ${token1}`,
    },
  ]
}

function Stats({
  mainTitle,
  info,
}: {
  mainTitle: string
  info: Array<{ title: string; amount: string }>
}): JSX.Element | null {
  return (
    <Column style={{ gap: '6px', width: '100%' }}>
      <MainTitle>{mainTitle}</MainTitle>

      {info.map((item, key) => (
        <RowStart key={key} style={{ gap: '8px' }}>
          <Title>{item.title}:</Title>
          <Amount>{item.amount}</Amount>
        </RowStart>
      ))}
    </Column>
  )
}

export default function UserStats({ userData }: { userData: any }) {
  const { pairs } = userData
  const { anydei_bh, dei_bh, anydei_now, dei_now, stuck_anydei } = userData.balance

  const { dei, deus, usdc } = userData.redeemed
  const DeiBalance = [
    { title: 'before', amount: toAmount(dei_bh) },
    { title: 'now', amount: toAmount(dei_now) },
    { title: 'DEI stuck in bridge', amount: toAmount(stuck_anydei) },
  ]
  const anyDeiBalance = [
    { title: 'before', amount: toAmount(anydei_bh) },
    { title: 'now', amount: toAmount(anydei_now) },
  ]
  const deiRedeemed = [
    { title: 'DEI', amount: toAmount(dei) },
    { title: 'DEUS', amount: toAmount(deus) },
    { title: 'USDC', amount: toAmount(usdc, 6) },
  ]
  const burned = [{ title: 'DEI', amount: toAmount(userData.burned) }]

  function isNoneZero(info: Array<{ title: string; amount: string }>): boolean {
    return info.filter((item) => has(item.amount)).length > 0
  }

  return (
    <Column style={{ gap: '35px', width: '100%' }}>
      {isNoneZero(DeiBalance) && <Stats mainTitle="DEI balance" info={DeiBalance} />}
      {isNoneZero(anyDeiBalance) && <Stats mainTitle="anyDEI balance" info={anyDeiBalance} />}
      {isNoneZero(deiRedeemed) && <Stats mainTitle="DEI Redeemed" info={deiRedeemed} />}
      {isNoneZero(burned) && <Stats mainTitle="Burned" info={burned} />}

      {getInfoDynamic(userData['buy']).length > 0 && <Stats mainTitle="Buys" info={getInfoDynamic(userData['buy'])} />}
      {getInfoDynamic(userData['sell']).length > 0 && (
        <Stats mainTitle="Sells" info={getInfoDynamic(userData['sell'])} />
      )}

      {getInfoDynamic(userData['arbitrage']).length > 0 && (
        <Stats mainTitle="Arbitrages" info={getInfoDynamic(userData['arbitrage'], true)} />
      )}

      {pairs.map((pair: any, key: number) => (
        <Stats key={key} mainTitle={pair.name} info={getLPInfo(pair)} />
      ))}
    </Column>
  )
}
