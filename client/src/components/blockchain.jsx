import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json'
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

  const contractAddress = '0xC70495d5a83d9cFCE712c545C68d7c7908Ac7311'; // Replace with actual deployed contract address
  const contractABI = abi; // Contract ABI from your first code block

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Profile Manager</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Store New Profile</h3>
          <form onSubmit={handleStoreProfile} className="flex gap-4">
            <input
              type="text"
              value={newIpfsHash}
              onChange={(e) => setNewIpfsHash(e.target.value)}
              placeholder="IPFS Hash"
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Storing...' : 'Store'}
            </button>
          </form>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Your Profiles</h3>
          <div className="space-y-2">
            {profiles.map((hash, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <span className="font-mono">{hash}</span>
                <button
                  onClick={() => {
                    setSelectedHash(hash);
                    loadAccessList(hash);
                  }}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Manage Access
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedHash && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Access Management</h3>
            <form onSubmit={handleGrantAccess} className="flex gap-4 mb-4">
              <input
                type="text"
                value={accessAddress}
                onChange={(e) => setAccessAddress(e.target.value)}
                placeholder="Address to grant access"
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Grant Access
              </button>
            </form>

            <div>
              <h4 className="font-semibold mb-2">Current Access List</h4>
              <div className="space-y-2">
                {accessList.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span className="font-mono">{address}</span>
                    <button
                      onClick={() => handleRevokeAccess(address)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bct;