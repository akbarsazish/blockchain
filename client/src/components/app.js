import React, { Component } from 'react';
import axios from 'axios';
import Blocks from './blocks';

class App extends Component {
    state = { walletInfo: {address:"", balance:""} } 

   async componentDidMount(){
        const response = await axios.get('http://localhost:3003/api/wallet-info');
        this.setState({walletInfo: response.data})
    }

    render() { 
        return (
            <>
              <h1> This is th app</h1>
              <h3> Address: {this.state.walletInfo.address} </h3>
              <h3> Address: {this.state.walletInfo.balance} </h3>
              <br />
              <Blocks />
            </>
        );
    }
}
 
export default App;