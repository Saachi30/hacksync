import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Upload, File, X, Wallet } from 'lucide-react';
import abi from '../abi.json';

const Bct = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [newIpfsHash, setNewIpfsHash] = useState('');
  const [accessAddress, setAccessAddress] = useState('');
  const [selectedHash, setSelectedHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const contractAddress = '0xC70495d5a83d9cFCE712c545C68d7c7908Ac7311';
  const contractABI = abi;

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          
          setAccount(accounts[0]);
          setContract(contractInstance);
          await loadProfiles(contractInstance, accounts[0]);
        }
      } catch (err) {
        setError('Failed to initialize web3');
      }
    };
    init();
  }, []);

  const PINATA_API_KEY = 'd2ca3a54f0ec3dff1eaf';
  const PINATA_API_SECRET = '8d7e8e7dc4106bedbbe5649b3f089ba264e97ff02ba83d8fede01301495bab8e'; // You'll need to provide this
  const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const uploadToPinata = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(PINATA_API_URL, {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.IpfsHash) {
        setNewIpfsHash(result.IpfsHash);
        return result.IpfsHash;
      } else {
        throw new Error('No IPFS hash received');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload to IPFS: ${err.message}`);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      try {
        await uploadToPinata(file);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const loadProfiles = async (contractInstance, userAccount) => {
    try {
      const profileData = await contractInstance.getMyProfile();
      setProfiles(profileData);
    } catch (err) {
      setError('Failed to load profiles');
    }
  };

  const handleStoreProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const tx = await contract.storeProfile(newIpfsHash);
      await tx.wait();
      await loadProfiles(contract, account);
      setNewIpfsHash('');
      setUploadedFile(null);
    } catch (err) {
      setError('Failed to store profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const tx = await contract.grantAccess(accessAddress, selectedHash);
      await tx.wait();
      await loadAccessList(selectedHash);
      setAccessAddress('');
    } catch (err) {
      setError('Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (address) => {
    setLoading(true);
    setError('');
    
    try {
      const tx = await contract.revokeAccess(address, selectedHash);
      await tx.wait();
      await loadAccessList(selectedHash);
    } catch (err) {
      setError('Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessList = async (hash) => {
    try {
      const list = await contract.getGrantedAccessList(account, hash);
      setAccessList(list);
    } catch (err) {
      setError('Failed to load access list');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Wallet Address Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Connected Wallet:</span>
          </div>
          <span className="font-mono text-sm bg-blue-50 text-blue-700 py-2 px-4 rounded-lg">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <h2 className="text-3xl font-bold text-white">Personalised Access Manager</h2>
            <p className="mt-2 text-blue-100">Manage your decentralized profiles securely</p>
          </div>

          {error && (
            <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-8 py-6 space-y-8">
            {/* File Upload Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload to IPFS</h3>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-blue-50 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-blue-500" />
                    {uploadedFile ? (
                      <div className="text-center">
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">{uploadedFile.name}</span>
                        </p>
                        {uploading && (
                          <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Any file type (MAX. 100MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Store Profile Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Store New Profile</h3>
              <form onSubmit={handleStoreProfile} className="flex gap-4">
                <input
                  type="text"
                  value={newIpfsHash}
                  onChange={(e) => setNewIpfsHash(e.target.value)}
                  placeholder="IPFS Hash"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || !newIpfsHash}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Storing...' : 'Store Profile'}
                </button>
              </form>
            </div>

            {/* Profiles List */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Profiles</h3>
              <div className="space-y-3">
                {profiles.map((hash, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-mono text-sm text-gray-600">{hash}</span>
                    <button
                      onClick={() => {
                        setSelectedHash(hash);
                        loadAccessList(hash);
                      }}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200"
                    >
                      Manage Access
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Access Management Section */}
            {selectedHash && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Management</h3>
                <form onSubmit={handleGrantAccess} className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={accessAddress}
                    onChange={(e) => setAccessAddress(e.target.value)}
                    placeholder="Address to grant access"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading || !accessAddress}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Grant Access
                  </button>
                </form>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Current Access List</h4>
                  <div className="space-y-3">
                    {accessList.map((address, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <span className="font-mono text-sm text-gray-600">{address}</span>
                        <button
                          onClick={() => handleRevokeAccess(address)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors duration-200"
                        >
                          Revoke Access
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bct;