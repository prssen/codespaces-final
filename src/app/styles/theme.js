import { useMemo } from 'react';
import { createTheme } from "@mui/material/styles";
import { lightBlue, grey } from '@mui/material/colors';
import { lighten } from '@mui/material/styles';

// import Raleway from "public/fonts/Raleway-VariableFont_wght.ttf";
// import { useState, useMemo } from "react";

// const [mode, setMode] = useState('light');

// Credit: adapted from React Material UI docs 
// (https://mui.com/material-ui/customization/typography/)
const theme = (mode) => {
  console.log('Mode imported is: ', mode);

  let themeObj = createTheme({
    palette: {
      mode: mode,
      ...(mode === 'light' && {background: {paper: '#f1f1f1'}}),
      // paper: mode === 'light' :  
      // action: {
      //   active: lightBlue[200],
      //   activeOpacity: 1,
      //   hover: lightBlue[100],
      //   hoverOpacity: 0.7,
      //   focus: lightBlue[600],
      //   focusOpacity: 1,
      //   selected: lightBlue[300],
      //   selectedOpacity: 1
      // },
    },
    typography: {
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightSemibold: 600,
      fontWeightBold: 700,
      h1: {
        fontSize: "2.207rem",
        fontWeight: 600,
      },
      h2: {
        fontSize: "1.802rem",
        fontWeight: 600,
      },
      h3: {
        fontSize: "1.602rem",
        fontWeight: 600,
      },
      h4: {
        fontSize: "1.424rem",
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.266rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
      },
      body2: {
        fontSize: "0.889rem",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 5,
            // border: 2,
            // borderColor: 'grey',
            elevation: 0,
            boxShadow: 'none'
          },

        },
        defaultProps: {
          disableElevation: true
        }
      },
      // TODO: debug why border is not appearing
      // when defined here
      MuiDrawer: {
        styleOverrides: {
          paper: { 
            backgroundColor: 'white',
            // border: 1,
            // borderColor: grey[200],
          }
        }
      },
      MuiPaper: {
        boxShadow: 0
      },
      // MuiCssBaseline: {
      //   styleOverrides: `
      //     @font-face {
      //       font-family: 'Raleway';
      //       font-style: 'semi-bold';
      //       font-display: swap;
      //       font-weight: 600;
      //       src: local('Raleway'), local('Raleway-Regular'), url(${Raleway}) format('ttf');
      //       unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
      //     }
      //   `,
      // },
    },
    ...(mode === 'light' && { shadows: 'none'})
  });

  // Declare values that depend on other theme values separately, after
  // object creation
  // Surfaces that are on top of other surfaces appear lighter
  // (credit: https://stackoverflow.com/a/66612868)
  themeObj = {
    ...themeObj,
    commponents: {
        MuiPaper: {
          styleOverrides: {
            ...(mode === 'light' && {backgroundColor: (props) =>
              lighten(theme.palette.background.paper, props.elevation * 0.025)})
          }
        }
    }
  }

  return themeObj;
};

// export { mode, setMode };

export default theme;

  
// TODO: from perplexity.ai - explore adding this

// const titilliumWeb = {
//     fontFamily: 'TitilliumWeb',
//     fontStyle: 'semi-bold',
//     fontDisplay: 'swap',
//     fontWeight: '600',
//     src: `
//       local('TitilliumWeb'),
//       local('TitilliumWeb-SemiBold'),
//       url(${TitilliumWeb}) format('ttf')
//     `,
//     unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF',
//   };
  
//   const theme = createTheme({
//     typography: {
//       fontFamily: ['"Open Sans"', 'TitilliumWeb', 'Roboto'].join(','),
//     },
//     overrides: {
//       MuiCssBaseline: {
//         '@global': {
//           '@font-face': [titilliumWeb],
//         },
//       },
//     },
//   });
  

// TODO: wrap code in ThemeProvider if creating a theme:
/* <ThemeProvider theme={theme}>
<CssBaseline />
<App />
</ThemeProvider>, */