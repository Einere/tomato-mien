import "csstype";

declare module "csstype" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Properties<TLength, TTime> {
    cornerShape?: "round" | "scoop" | "notch" | "bevel" | "squircle";
  }
}
