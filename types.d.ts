declare module 'img:*' {
  const result: {
    format: 'png' | 'jpeg';
    filename: string;
    // base64: string;
    height: number;
    width: number;
    bytes: number;
    hash: number;
  };

  export = result;
}
