/** biome-ignore-all lint/complexity/noStaticOnlyClass: external lib */
export class Crypto {
  public static get current() {
    return Crypto.hasSubtleCrypto
      ? window.crypto
      : Crypto.tryLoadNodeWebCrypto();
  }

  private static get hasSubtleCrypto() {
    return (
      typeof window !== "undefined" &&
      typeof window.crypto !== "undefined" &&
      typeof window.crypto.subtle !== "undefined"
    );
  }

  private static tryLoadNodeWebCrypto() {
    const { webcrypto } = require("crypto");
    return webcrypto;
  }
}

export default Crypto;
