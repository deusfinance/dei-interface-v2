import Lottie from 'react-lottie'
import * as animationData from 'constants/lottie/dei-loading.json'

export default function LottieDei({ height = 150, width = 340 }: { height?: number; width?: number }) {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return <Lottie options={defaultOptions} height={height} width={width} />
}
