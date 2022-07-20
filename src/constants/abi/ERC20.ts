import { Interface } from '@ethersproject/abi'

import ERC20_ABI from './ERC20.json'
import ERC20_BYTES32_ABI from './ERC20_BYTES32.json'

const ERC20_INTERFACE = new Interface(ERC20_ABI)

const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI)

export default ERC20_INTERFACE
export { ERC20_ABI, ERC20_BYTES32_ABI, ERC20_BYTES32_INTERFACE }
