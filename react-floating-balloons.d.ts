declare module "react-floating-balloons" {
  import { FC } from "react";
  interface FloatingBalloonsProps {
    count?: number;
    msgText?: string;
    colors?: string[];
    popVolumeLevel?: number;
    loop?: boolean;
    hangOnTop?: boolean;
  }
  const FloatingBalloons: FC<FloatingBalloonsProps>;
  export default FloatingBalloons;
}
