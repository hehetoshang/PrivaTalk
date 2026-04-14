// 生成RSA密钥对
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  // 导出公钥
  const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyPem = bufferToPem(publicKeyBuffer, 'PUBLIC KEY');

  // 导出私钥
  const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyPem = bufferToPem(privateKeyBuffer, 'PRIVATE KEY');

  return { publicKey: publicKeyPem, privateKey: privateKeyPem };
}

// PEM格式转CryptoKey
export async function pemToCryptoKey(pem: string, type: 'public' | 'private'): Promise<CryptoKey> {
  try {
    // 首先标准化PEM头部和尾部，处理可能缺少空格的情况
    let normalizedPem = pem
      .replace(/-----BEGIN([\w\s]+)-----/g, (_, content) => `-----BEGIN ${content.trim()}-----`)
      .replace(/-----END([\w\s]+)-----/g, (_, content) => `-----END ${content.trim()}-----`);
    
    // 移除PEM头部和尾部
    normalizedPem = normalizedPem
      .replace(/-----BEGIN [\w\s]+-----/g, '')
      .replace(/-----END [\w\s]+-----/g, '')
      .trim();
    
    // 移除所有空白字符（包括换行符、空格、制表符等）
    let pemContents = normalizedPem.replace(/\s/g, '');
    
    // 验证是否只包含Base64允许的字符
    if (!/^[A-Za-z0-9+/=]*$/.test(pemContents)) {
      console.error('PEM contains invalid characters');
      throw new Error('公钥格式错误：包含无效字符。请检查公钥格式是否正确。');
    }
    
    // 确保Base64字符串长度是4的倍数
    while (pemContents.length % 4 !== 0) {
      pemContents += '=';
    }
    
    // 尝试解码Base64，捕获可能的错误
    let binaryDer;
    try {
      binaryDer = window.atob(pemContents);
    } catch (base64Error) {
      console.error('Base64 decoding error:', base64Error);
      console.error('Original PEM:', pem.substring(0, 200));
      console.error('Normalized PEM contents:', pemContents.substring(0, 100));
      throw new Error('公钥格式错误：Base64编码无效。请检查公钥是否完整且格式正确。');
    }
    
    const binaryDerBuffer = new ArrayBuffer(binaryDer.length);
    const binaryDerView = new Uint8Array(binaryDerBuffer);
    
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerView[i] = binaryDer.charCodeAt(i);
    }

    if (type === 'public') {
      try {
        return await window.crypto.subtle.importKey(
          'spki',
          binaryDerBuffer,
          { name: 'RSA-OAEP', hash: 'SHA-256' },
          true,
          ['encrypt']
        );
      } catch (importError) {
        console.error('Error importing public key:', importError);
        throw new Error('公钥格式错误：无法导入公钥。请确保输入的是有效的RSA公钥。');
      }
    } else {
      try {
        return await window.crypto.subtle.importKey(
          'pkcs8',
          binaryDerBuffer,
          { name: 'RSA-OAEP', hash: 'SHA-256' },
          true,
          ['decrypt']
        );
      } catch (importError) {
        console.error('Error importing private key:', importError);
        throw new Error('私钥格式错误：无法导入私钥。请确保输入的是有效的RSA私钥。');
      }
    }
  } catch (error) {
    console.error('Error converting PEM to CryptoKey:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('密钥格式错误。请检查密钥是否完整且格式正确。');
  }
}

// 加密文本
export async function encryptText(publicKeyPem: string, plaintext: string): Promise<string> {
  const publicKey = await pemToCryptoKey(publicKeyPem, 'public');
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// 解密文本
export async function decryptText(privateKeyPem: string, ciphertext: string): Promise<string> {
  try {
    const privateKey = await pemToCryptoKey(privateKeyPem, 'private');
    
    // 尝试解码Base64密文
    let encryptedData;
    try {
      const binaryString = atob(ciphertext);
      encryptedData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedData[i] = binaryString.charCodeAt(i);
      }
    } catch (base64Error) {
      console.error('Base64 decoding error during decryption:', base64Error);
      throw new Error('密文格式错误：Base64编码无效。请检查密文是否完整且格式正确。');
    }
    
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      throw new Error('解密失败：请检查密文是否正确，以及是否使用了正确的私钥。');
    }
  } catch (error) {
    console.error('Error during decryption:', error);
    throw error;
  }
}

// 辅助函数：Buffer转PEM
function bufferToPem(buffer: ArrayBuffer, label: string): string {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  const base64 = btoa(binary);
  const chunks = base64.match(/.{1,64}/g) || [];
  const pem = [
    `-----BEGIN ${label}-----`,
    ...chunks,
    `-----END ${label}-----`
  ].join('\n');
  return pem;
}

// 从密码派生密钥
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// 使用密码加密文本
export async function encryptWithPassword(password: string, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKeyFromPassword(password, salt);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // 组合salt + iv + encrypted data
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  // 转换为Base64
  return btoa(String.fromCharCode(...result));
}

// 使用密码解密文本
export async function decryptWithPassword(password: string, ciphertext: string): Promise<string> {
  try {
    // 解码Base64
    const binaryString = atob(ciphertext);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 提取salt, iv和加密数据
    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const encryptedData = bytes.slice(28);

    const key = await deriveKeyFromPassword(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Password decryption error:', error);
    throw new Error('密码解密失败：请检查密码是否正确。');
  }
}