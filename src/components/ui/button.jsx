import React from "react";
import Button from "@mui/material/Button";

const CustomButton = ({ children, variant = "contained", color = "primary", onClick }) => {
  return (
    <Button variant={variant} color={color} onClick={onClick}>
      {children}
    </Button>
  );
};

export default CustomButton;
