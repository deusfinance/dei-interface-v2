import React, { useMemo } from 'react'
import { Text, TextProps as TextPropsOriginal } from 'rebass'
import styled, {
  createGlobalStyle,
  css,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components'

import { useIsDarkMode } from 'state/user/hooks'
import { Colors, Shadows } from './styled'
import { useRouter } from 'next/router'

type TextProps = Omit<TextPropsOriginal, 'css'>

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
  upToExtraLarge: 1600,
}

export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export enum SupportedThemes {
  LIGHT = 'light',
  DARK = 'dark',
}

function colors(themeName: SupportedThemes): Colors {
  // define color scheme for each supported theme
  const themeColors = {
    [SupportedThemes.LIGHT]: {
      themeName: SupportedThemes.LIGHT,

      // base
      white,
      black,

      // text
      text1: '#000000',
      text2: '#78787B',
      text3: '#808086',
      text4: '#B8B8BE',

      // backgrounds / greys
      bg0: '#FFFFFF',
      bg1: '#F5F6FC',
      bg2: '#28292B',
      bg3: '#1C1D1E',
      bg4: '#8F939C',
      bg5: '#23252C',
      bg6: '#2a2c2e',
      bg7: '#222325',
      bg8: '#6F7074',

      // borders
      border1: '#B8B8BE',
      border2: 'linear-gradient(90deg, #0BADF4 0%, #30EFE4 93.4%)',
      border3: 'rgba(99, 126, 161, 0.2)',

      //specialty colors
      specialBG1: 'linear-gradient(90deg, #0BADF4 0%, #30EFE4 93.4%)',
      specialBG2:
        'linear-gradient(90deg, rgba(81, 171, 255, 0.1) 0%, rgba(22, 72, 250, 0.1) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',

      // primary colors
      primary1: 'linear-gradient(90deg,#0BADF4 0%,#30EFE4 93.4%)',
      primary2: 'linear-gradient(90deg, #FFBA35 1.54%, #FFA76A 50%)',
      primary3: '#FFBA35',
      primary4: 'linear-gradient(92.33deg, #DE4A7B -10.26%, #E29D52 80%)',
      primary5: 'linear-gradient(92.33deg, #8f3e5c -10.26%, #a97d4d 80%)',
      primary6: 'linear-gradient(-90deg, #B63562 10%, #CF8D49 90%)',
      primary7: 'linear-gradient(90deg, #B63562 10%, #CF8D49 90%)',
      primary8: 'linear-gradient(90deg, #F78C2A 0%, #F34038 100%)',

      // color text
      primaryText1: '#FFB463',

      // secondary colors
      secondary1: '#1749FA',
      secondary2: 'rgba(23, 73, 250, 0.2)',

      // other
      red1: '#DD5D5D',
      red2: '#DF1F38',
      red3: '#D60000',
      green1: '#007D35',
      yellow1: '#E3A507',
      yellow2: '#FF8F00',
      yellow3: '#F3B71E',
      yellow4: '#FFBA93',
      blue1: '#0068FC',
      blue2: '#0068FC',
      deusBlue: '#30efe4',
      darkPink: '#de4a7b',
      orange: '#D79747',
      darkOrange: '#391D12',

      error: '#DF1F38',
      success: '#007D35',
      warning: '#FF8F00',
      deusColor: 'linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%)',
      deiColor: 'linear-gradient(90deg, #E0974C 0%, #C93F6F 100%)',
      deiLegacyColor: '#966131',
      cLqdrColor: '#06EBC8',
      clqdrBlueColor: '#0ACBEB',
      lqdrColor: 'linear-gradient(339.11deg, #1984FF 9.31%, #4DD9F6 96.03%)',
      clqdChartPrimaryColor: '#0BADF4',
      clqdChartSecondaryColor: '#30EFE4',
      deiPrimaryColor: '#CF8D49',
      deiSecondaryColor: '#B63562',
    },
    [SupportedThemes.DARK]: {
      themeName: SupportedThemes.DARK,

      // base
      white,
      black,

      // text
      text1: '#EBEBEC',
      text2: '#6F7380',
      text3: '#CCCCCC',
      text4: '#B2B9D2',

      // backgrounds / greys
      bg0: '#141414',
      bg1: '#1A1B1B',
      bg2: '#28292B',
      bg3: '#1C1D1E',
      bg4: '#8F939C',
      bg5: '#23252C',
      bg6: '#2a2c2e',
      bg7: '#222325',
      bg8: '#6F7074',

      // borders
      border1: '#1B1B1B',
      border2: '#353639',
      border3: '#55575F',

      //specialty colors
      specialBG1: 'linear-gradient(90deg, #0BADF4 0%, #30EFE4 93.4%)',
      specialBG2: '#14181E',

      // primary colors
      primary1: 'linear-gradient(90deg,#0BADF4 0%,#30EFE4 93.4%)',
      primary2: 'linear-gradient(92.33deg, #E29D52 -10.26%, #DE4A7B 80%)',
      primary3: '#FFBA35',
      primary4: 'linear-gradient(92.33deg, #DE4A7B -10.26%, #E29D52 80%)',
      primary5: 'linear-gradient(-92.33deg, #421D2D -10.26%, #493625 80%)',
      primary6: 'linear-gradient(-90deg, #B63562 10%, #CF8D49 90%)',
      primary7: 'linear-gradient(90deg, #30EFE4 10%, #0BADF4 90%)',
      primary8: 'linear-gradient(90deg, #F78C2A 0%, #F34038 100%)',
      // color text
      primaryText1: '#1749FA',

      // secondary colors
      secondary1: '#1749FA',
      secondary2: 'rgba(23, 73, 250, 0.2)',

      // other
      red1: '#DD5D5D',
      red2: '#F82D3A',
      red3: '#D60000',
      green1: '#27AE60',
      yellow1: '#E3A507',
      yellow2: '#FF8F00',
      yellow3: '#F3B71E',
      yellow4: '#FFBA93',
      blue1: '#2172E5',
      blue2: '#5199FF',
      deusBlue: '#30efe4',
      darkPink: '#de4a7b',
      orange: '#D79747',
      darkOrange: '#391D12',

      error: '#FD4040',
      success: '#27AE60',
      warning: '#FF8F00',

      deusColor: 'linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%)',
      deiColor: 'linear-gradient(90deg, #E0974C 0%, #C93F6F 100%);',
      deiLegacyColor: '#966131',
      cLqdrColor: '#06EBC8',
      clqdrBlueColor: '#0ACBEB',
      lqdrColor: 'linear-gradient(339.11deg, #1984FF 9.31%, #4DD9F6 96.03%)',
      clqdChartPrimaryColor: '#0BADF4',
      clqdChartSecondaryColor: '#30EFE4',
      deiPrimaryColor: '#CF8D49',
      deiSecondaryColor: '#B63562',
    },
  }
  // default the theme to light mode
  return themeName in SupportedThemes ? themeColors[SupportedThemes.LIGHT] : themeColors[themeName]
}

// define shadow scheme for each supported theme
function shadows(themeName: SupportedThemes): Shadows {
  const themeShadows = {
    [SupportedThemes.LIGHT]: {
      shadow1: '#2F80ED',
      boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
      boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',
    },
    [SupportedThemes.DARK]: {
      shadow1: '#000',
      boxShadow1: '0px 0px 4px rgba(0, 0, 0, 0.125)',
      boxShadow2: '0px 5px 5px rgba(0, 0, 0, 0.15)',
    },
  }
  // default the theme to light mode
  return themeName in SupportedThemes ? themeShadows[SupportedThemes.LIGHT] : themeShadows[themeName]
}

function theme(themeName: SupportedThemes): DefaultTheme {
  return {
    ...colors(themeName),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    ...shadows(themeName),

    // media queries
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // get theme name from url if any
  const router = useRouter()
  const parsed = router.query?.theme
  const parsedTheme = parsed && typeof parsed === 'string' ? parsed : undefined

  const darkMode = useIsDarkMode()

  let themeName: SupportedThemes
  if (parsedTheme && Object.values(SupportedThemes).some((theme: string) => theme === parsedTheme)) {
    themeName = parsedTheme as SupportedThemes
  } else {
    themeName = darkMode ? SupportedThemes.DARK : SupportedThemes.LIGHT
  }

  const themeObject = useMemo(() => theme(themeName), [themeName])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

/**
 * Preset styles of the Rebass Text component
 */
export const ThemedText = {
  Main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  Link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  Label(props: TextProps) {
    return <TextWrapper fontWeight={600} color={'text1'} {...props} />
  },
  Black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  White(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  Body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  LargeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />
  },
  MediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />
  },
  SubHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  Small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  Blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  Yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  DarkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  Gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  Italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  Error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}

export const ThemedGlobalStyle = createGlobalStyle`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg0} !important;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
  }
  a {
    color: ${({ theme }) => theme.text1}; 
  }

  * {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter';
    font-weight:400;
    background: ${({ theme }) => theme.bg4};
  }

  button {
    all: unset;
    cursor: pointer;
    padding: 0px;
  }

  *, *:before, *:after {
    -webkit-box-sizing: inherit;
    -moz-box-sizing: inherit;
    box-sizing: inherit;
  }

  * {
    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    // overflow-y: hidden;
  }
  *::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  /* Firefox */
  input[type=number] {
    font-family: 'IBM Plex Mono';
    -moz-appearance: textfield;
  }
`
