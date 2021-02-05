declare module 'img:*' {
  const result: {
    filename: string;
    base64: string;
    height: number;
    width: number;
    bytes: number;
    hash: number;
  };

  export = result;
}
