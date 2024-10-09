import styled, { keyframes } from "styled-components";
import image from "../static/images/fight.png";
import { useEffect } from "react";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const LoaderImage = styled.img`
  width: 400px;
  height: 400px;
  animation: ${rotate} 5s linear infinite;
`;

const Loader = () => {
  useEffect(() => {
      document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <Overlay>
      <LoaderImage src={image} alt="Loading..." />
    </Overlay>
  );
};

export default Loader;
