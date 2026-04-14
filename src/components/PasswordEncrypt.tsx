import React, { useState } from 'react';

interface PasswordEncryptProps {
  isEncrypting: boolean;
  encryptionResult: string;
  onEncrypt: (password: string, plaintext: string) => void;
  onCopy: (text: string) => Promise<boolean>;
}

const PasswordEncrypt: React.FC<PasswordEncryptProps> = ({
  isEncrypting,
  encryptionResult,
  onEncrypt,
  onCopy,
}) => {
  const [password, setPassword] = useState('');
  const [plaintext, setPlaintext] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEncrypt = () => {
    if (!password || !plaintext) {
      return;
    }
    onEncrypt(password, plaintext);
  };

  const handleCopy = async () => {
    const success = await onCopy(encryptionResult);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">密码加密</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            placeholder="输入加密密码..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            明文
          </label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            rows={4}
            placeholder="输入要加密的文本..."
          />
        </div>

        <button
          onClick={handleEncrypt}
          disabled={isEncrypting || !password || !plaintext}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isEncrypting ? '加密中...' : '加密'}
        </button>

        {encryptionResult && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              加密结果（复制发送给对方）
            </label>
            <div className="relative">
              <textarea
                value={encryptionResult}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                rows={4}
              />
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-md transition-colors duration-200"
              >
                {copySuccess ? '已复制!' : '复制'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordEncrypt;