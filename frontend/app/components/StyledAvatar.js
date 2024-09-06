import { Box, Avatar } from "@mui/material";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

export const StyledAvatar = ({ isClicked, image, sx }) => {
    return (
      <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', spacing: 1}}>
        <Avatar
                sx={{
                  border: '2px solid green',
                  height: 35,
                  width: 35,
                  mr: 1,
                  ...sx
                }} 
                src={image || "https://avatar.iran.liara.run/public/5"}
              />
        {isClicked ? <BiChevronUp /> : <BiChevronDown />}
      </Box>
    )
  
  }