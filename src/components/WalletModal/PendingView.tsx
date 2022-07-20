import styled from 'styled-components'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected } from '../../connectors'
import { SUPPORTED_WALLETS } from 'constants/wallet'
import { Loader } from 'components/Icons'
import Option from './Option'

const PendingSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
`

const LoadingMessage = styled.div<{
  error?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  border-radius: 12px;
  margin-bottom: 20px;
  color: ${({ error, theme }) => (error ? theme.red3 : 'inherit')};
  border: 1px solid ${({ theme, error }) => (error ? theme.red3 : theme.border2)};
  & > * {
    padding: 1rem;
  }
`

const ErrorGroup = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`

const ErrorButton = styled.div`
  border-radius: 8px;
  font-size: 0.8rem;
  background: ${({ theme }) => theme.bg2};
  margin-left: 1rem;
  padding: 0.5rem;
  user-select: none;
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg3};
  }
`

const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
`

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation,
}: {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}) {
  const isMetamask = window.ethereum?.isMetaMask
  return (
    <PendingSection>
      <LoadingMessage error={error}>
        <LoadingWrapper>
          {error ? (
            <ErrorGroup>
              <div>Error connecting</div>
              <ErrorButton
                onClick={() => {
                  setPendingError(false)
                  connector && tryActivation(connector)
                }}
                style={{ marginLeft: 'auto' }}
              >
                Try Again
              </ErrorButton>
            </ErrorGroup>
          ) : (
            <>
              <StyledLoader />
              Initializing...
            </>
          )}
        </LoadingWrapper>
      </LoadingMessage>
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null
            }
          }
          return (
            <Option
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={option.iconURL}
            />
          )
        }
        return null
      })}
    </PendingSection>
  )
}
