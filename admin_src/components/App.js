import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ModalContainer from './ModalContainer';
import {connect} from 'react-redux';

class App extends React.Component {
  state = {
    loaded:false
  }
  componentDidMount(){
    this.getCurrentState();
  }
  getCurrentState(){
    fetch('/me?shouldBeAdmin=true').then((response) => {
      return response.json().then((json) => {
        if(json.ok)
        {
          
          this.props.dispatch({
            type:'UPDATE_USER',
            user : json.user,
            token: json.token
          })
          this.setState({
            loaded : true
          })
        }else{
          window.location.href='/';
        }
      });

    });
  }
  render() {
    return (
      <div>
        <Header/>
        {this.state.loaded ? this.props.children : false}
        <Footer/>
        <ModalContainer />
      </div>
    );
  }
}


const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(App);
 