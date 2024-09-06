// Link component compatible with Next.js and Material UI
// Credit: https://stackoverflow.com/a/72224893

import { forwardRef } from 'react';
import NextLink from 'next/link';
import { Link as MuiLink } from '@mui/material';

const Link = forwardRef((props, ref)=>{
  const {href} = props;
  return <NextLink href={href} passHref legacyBehavior>
          <MuiLink ref={ref} {...props}/>
          </NextLink>
})
Link.displayName = 'CustomLink';

export default Link;