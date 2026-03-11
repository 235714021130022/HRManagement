import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';

export const theme = extendTheme({
  styles: {
    global: {
      '.hide-scrollbar': {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      },
    },
  },
  colors: {
    ...colors.baseColors,
    ...colors.textColors,
    ...colors.bgColors,
    ...colors.tableColors,
    ...colors.inputColors,
    charts: {
      ...colors.charts,
    },
  },
});
export default theme;
