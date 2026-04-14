import React, { useState } from 'react';

interface PasswordDecryptProps {
  isDecrypting: boolean;
  decryptionResult: string;
  onDecrypt: (password: string, ciphertext: string) => void;
}

const PasswordDecrypt: React.FC<PasswordDecryptProps> = ({
  isDecrypting,
  decryptionResult,
  onDecrypt,
}) => {
  const [password, setPassword] = useState('');
  const [ciphertext, setCiphertext] = useState('');

  const handleDecrypt = () => {
    if (!password || !ciphertext) {
      return;
    }
    onDecrypt(password, ciphertext);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">密码解密</h2>
      
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
            placeholder="输入解密密码..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密文
          </label>
          <textarea
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono"
            rows={4}
            placeholder="粘贴要解密的密文..."
          />
        </div>

        <button
          onClick={handleDecrypt}
          disabled={isDecrypting || !password || !ciphertext}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isDecrypting ? '解密中...' : '解密'}
        </button>

        {decryptionResult && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              解密结果
            </label>
            <textarea
              value={decryptionResult}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-gray-50"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordDecrypt;