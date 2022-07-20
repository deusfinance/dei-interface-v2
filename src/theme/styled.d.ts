import { ThemedCssFunction } from 'styled-components/macro'
import { SupportedThemes } from 'theme'

export type Color = string
export interface Colors {
  themeName: SupportedThemes

  // base
  white: Color
  black: Color

  // text
  text1: Color
  text2: Color
  text3: Color
  text4: Color

  // backgrounds
  bg0: Color
  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  bg5: Color

  // borders
  border1: Color
  border2: Color

  specialBG1: Color
  specialBG2: Color

  //blues
  primary1: Color
  primary2: Color
  primary3: Color
  primary4: Color

  primaryText1: Color

  // pinks
  secondary1: Color
  secondary2: Color

  // other
  red1: Color
  red2: Color
  red3: Color
  green1: Color
  yellow1: Color
  yellow2: Color
  yellow3: Color
  yellow4: Color
  blue1: Color
  blue2: Color

  error: Color
  success: Color
  warning: Color
}

export type Shadow = string
export interface Shadows {
  shadow1: Shadow
  boxShadow1: Shadow
  boxShadow2: Shadow
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors, Shadows {
    grids: Grids

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
      upToExtraLarge: ThemedCssFunction<DefaultTheme>
    }
  }
}
