const COOKIE_NAME = 'encryption_keys';
const COOKIE_EXPIRES = 30; // 30天过期

// 存储密钥到cookie
export function saveKeys(publicKey: string, privateKey: string): void {
  const keys = JSON.stringify({ publicKey, privateKey });
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + COOKIE_EXPIRES);
  
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(keys)}; expires=${expirationDate.toUTCString()}; path=/`;
}

// 从cookie获取密钥
export function getKeys(): { publicKey: string; privateKey: string } | null {
  const cookieValue = document.cookie
    .split(';')
    .find(row => row.trim().startsWith(`${COOKIE_NAME}=`));
  
  if (!cookieValue) {
    return null;
  }
  
  try {
    const keys = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
    return { publicKey: keys.publicKey, privateKey: keys.privateKey };
  } catch (error) {
    console.error('Error parsing keys from cookie:', error);
    return null;
  }
}

// 从cookie删除密钥
export function removeKeys(): void {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// 存储私钥到cookie（保持向后兼容）
export function savePrivateKey(privateKey: string): void {
  // 这个函数保留但不使用，保持API兼容
  console.warn('savePrivateKey is deprecated, use saveKeys instead');
}

// 从cookie获取私钥（保持向后兼容）
export function getPrivateKey(): string | null {
  const keys = getKeys();
  return keys ? keys.privateKey : null;
}

// 从cookie删除私钥（保持向后兼容）
export function removePrivateKey(): void {
  removeKeys();
}