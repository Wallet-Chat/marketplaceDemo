import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import { getEllipsisTxt } from "helpers/formatters";
import Blockie from "./Blockie";
import { Button, Card, Modal } from "antd";
import { useState } from "react";
import Address from "./Address/Address";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import Web3 from 'web3'
import { ethers } from 'ethers'
//import Web3Modal from 'web3modal'
import Web3Modal from '@0xsequence/web3modal'
import { SiweMessage } from 'siwe'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { sequence } from '0xsequence'
import { WalletChatWidget } from "react-wallet-chat-nf3";

const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: "#21BF96",
  },
};

const providerOptions = {
  walletconnect: {
     package: WalletConnectProvider, // required
     options: {
        infuraId: process.env.REACT_APP_INFURA_ID, // required
     },
  },
  sequence: {
     package: sequence,
     options: {
        appName: 'WalletChat',
        //defaultNetwork: 'ethereum' // optional
     },
  }
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions, // required
})

const connectWallet = async (widgetState, setWidgetState) => {
  console.log('connectWallet')
  try {
     let _provider, _account, _nonce, _signer, _instance
     let _signedIn = false

      _instance = await web3Modal.connect()

      _provider = new ethers.providers.Web3Provider(_instance);
      _account = await _provider.getSigner().getAddress()
      _signer = await _provider.getSigner()
      const network = await _provider.getNetwork()

      //GET JWT
      fetch(` ${process.env.REACT_APP_REST_API}/users/${_account}/nonce`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then(async (data) => {
        console.log('✅[GET][Nonce]:', data)
        _nonce = data.Nonce
 
        //SIWE 
        const domain = window.location.hostname;
        const origin = window.location.protocol + domain;
        const statement =
          "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";
        
        const _siweMessage = new SiweMessage({
          domain,
          address: _account,
          statement,
          uri: origin,
          version: "1",
          chainId: network.chainId,
          nonce: _nonce,
        });
        
        const messageToSign = _siweMessage.prepareMessage();
        const signature = await _signer.signMessage(messageToSign); 
        //console.log("signature", signature);                  

        //end SIWE
        //const signature = await _signer.signMessage(_nonce)
        console.log('✅[INFO][Signature]:', signature)
      
        setWidgetState(
          {
            ...widgetState, 
            signature: signature,
            messageToSign: messageToSign,
            address: _account,
            nonce: _nonce,
            chainId: network.chainId,
            provider: _provider.connection.url
          }
        )
      })
      .catch((error) => {
        console.error('🚨[GET][Nonce]:', error)
      })
      //END JWT AUTH sequence
  //]       })
  } catch (error) {
     console.log('🚨connectWallet', error)
  } 
  finally {
    console.log('connectWallet final')
  }
}

function Account({widgetState, setWidgetState}) {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const { walletAddress, chainId } = useMoralisDapp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        style={styles.account}
        onClick={() => connectWallet(widgetState, setWidgetState)}
      >
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.account} onClick={() => setIsModalVisible(true)}>
        <p style={{ marginRight: "5px", ...styles.text }}>
          {getEllipsisTxt(walletAddress, 6)}
        </p>
        <Blockie currentWallet scale={3} />
      </div>
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500",
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width="400px"
      >
        Account
        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
          <Address
            avatar="left"
            size={6}
            copyable
            style={{ fontSize: "20px" }}
          />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a
              href={`${getExplorer(chainId)}/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
            >
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>
        <Button
          size="large"
          type="primary"
          style={{
            width: "100%",
            marginTop: "10px",
            borderRadius: "0.5rem",
            fontSize: "16px",
            fontWeight: "500",
          }}
          onClick={() => {
            logout();
            setIsModalVisible(false);
          }}
        >
          Disconnect Wallet
        </Button>
      </Modal>
    </>
  );
}

export default Account;
