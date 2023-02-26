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

const connectWallet = async () => {
  console.log('connectWallet')
  try {
     let _provider, _account, _nonce, _signer, _instance
     let _signedIn = false

      _instance = await web3Modal.connect()

      _provider = new ethers.providers.Web3Provider(_instance);
      _account = await _provider.getSigner().getAddress()
      _signer = await _provider.getSigner()
      const network = await _provider.getNetwork()

        // // check if JWT exists or is timed out:
        // fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/welcome`, {
        //    method: 'GET',
        //    headers: {
        //       'Content-Type': 'application/json',
        //       Authorization: `Bearer ${localStorage.getItem('jwt_' + _account)}`,
        //    },
        // })
        // .then((response) => response.json())
        // .then(async (data) => {
        //    console.log('✅[POST][Welcome]:', data.msg)
        //    //console.log('msg log: ', data.msg.toString().includes(_account.toLocaleLowerCase()), _account.toString())
        //    if (!data.msg.includes(_account.toLocaleLowerCase())) {
        //       //GET JWT
        //       fetch(` ${process.env.REACT_APP_REST_API}/users/${_account}/nonce`, {
        //          method: 'GET',
        //          headers: {
        //             'Content-Type': 'application/json',
        //          },
        //       })
        //       .then((response) => response.json())
        //       .then(async (data) => {
        //          console.log('✅[GET][Nonce]:', data)
        //          _nonce = data.Nonce
        //          //console.log('✅[GET][Data.nonce]:', data.Nonce)
        //          //const signature = await _signer.signMessage("Sign to Log in to WalletChat: " + _nonce)

        //          //SIWE and setup LIT authSig struct
        //          const domain = "walletchat.fun";
        //          const origin = "https://walletchat.fun";
        //          const statement =
        //            "You are signing a plain-text message to prove you own this wallet address. No gas fees or transactions will occur.";
                 
        //          const siweMessage = new SiweMessage({
        //            domain,
        //            address: _account,
        //            statement,
        //            uri: origin,
        //            version: "1",
        //            chainId: network.chainId,
        //            nonce: _nonce,
        //          });
                 
        //          const messageToSign = siweMessage.prepareMessage();
        //          const signature = await _signer.signMessage(messageToSign); 
        //          console.log("signature", signature);
                 
        //          //const recoveredAddress = 0x0;
        //          //server side checks is anyway, just a double check here with ethers lib
        //          // if (signature.length > 100) { //TODO: need a better way to determine EIP-1271
        //          //    recoveredAddress = _account
        //          // } else {
        //          //    recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
        //          // }
                 
        //          const authSig = {
        //            sig: signature,
        //            derivedVia: "web3.eth.personal.sign",
        //            signedMessage: messageToSign,
        //            address: _account.toLocaleLowerCase(),
        //          };
        //          //end SIWE and authSig

        //          //const signature = await _signer.signMessage(_nonce)
        //          console.log('✅[INFO][AuthSig]:', authSig)

        //          fetch(`${process.env.REACT_APP_REST_API}/signin`, {
        //             body: JSON.stringify({ "name": network.chainId.toString(), "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
        //             headers: {
        //             'Content-Type': 'application/json'
        //             },
        //             method: 'POST'
        //          })
        //          .then((response) => response.json())
        //          .then(async (data) => {             
        //             //Used for LIT encryption authSign parameter
        //             //localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
        //             //localStorage.setItem('lit-web3-provider', _provider.connection.url);
        //             console.log('✅[INFO][JWT]:', data.access)

        //             localStorage.setItem('jwt_' + _account, data.access);
        //          })
        //       })
        //       .catch((error) => {
        //          console.error('🚨[GET][Nonce]:', error)
        //       })
        //       //END JWT AUTH sequence

        //  //below part of /welcome check for existing token     
        //  }
        // })
        // .catch((error) => {
        //    console.error('🚨[POST][Welcome]:', error)
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
              //console.log('✅[GET][Data.nonce]:', data.Nonce)
              //const signature = await _signer.signMessage("Sign to Log in to WalletChat: " + _nonce)

              //SIWE and setup LIT authSig struct
              const domain = "walletchat.fun";
                 const origin = "https://walletchat.fun";
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
                 //const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
                 
                 const authSig = {
                   sig: signature,
                   derivedVia: "web3.eth.personal.sign",
                   signedMessage: messageToSign,
                   address: _account.toLocaleLowerCase(),
                 };
                 //end SIWE and authSig
              //const signature = await _signer.signMessage(_nonce)
              console.log('✅[INFO][Signature]:', signature)

              fetch(`${process.env.REACT_APP_REST_API}/signin`, {
                 body: JSON.stringify({ "name": network.chainId.toString(), "address": _account, "nonce": _nonce, "msg": messageToSign, "sig": signature }),
                 headers: {
                 'Content-Type': 'application/json'
                 },
                 method: 'POST'
              })
              .then((response) => response.json())
              .then(async (data) => {
                 //Used for LIT encryption authSign parameter
                 // localStorage.setItem('lit-auth-signature', JSON.stringify(authSig));
                 // localStorage.setItem('lit-web3-provider', _provider.connection.url);
                 console.log('✅[INFO][JWT]:', data.access)

                 localStorage.setItem('jwt_' + _account, data.access);
              })
              .catch((error) => {
                 console.error('🚨[GET][Sign-In Failed]:', error)
              })
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

function Account() {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const { walletAddress, chainId } = useMoralisDapp();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        style={styles.account}
        onClick={() => connectWallet()}
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
