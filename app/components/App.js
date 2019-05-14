import React from 'react';
import Header from './Modules/Header';
// import Header2 from './Header2';
import Footer from './Modules/Footer';

import ModalContainer from './ModalContainer';

import {withLocalize} from 'react-localize-redux';

class App extends React.Component {
  loadLang() {}

  componentDidMount() {
    this.langLoader();
  }
  //
  // loadLang(lang_data) {
  //   this.props.dispatch({
  //     type: 'SET_LANG',
  //     data: 'sdf'
  //   });
  // }

  downloadLang(lang) {
    fetch('/api/lang/').then(resp => {
      if (resp.ok) {
        resp.json().then(json => {
          // this.props.dispatch(addTranslation(json));
          this.props.addTranslation(json);

          //
          // localStorage.setItem('lang_'+lang, JSON.stringify(json));
          // this.loadLang(json);
        });
      }
    });
  }

  langLoader() {
    const languages = ['en', 'fr'];

    this.props.initialize({
      languages,
      options: {
        renderToStaticMarkup: false,
        renderInnerHtml: true,
        defaultLanguage: 'en',
        onMissingTranslation: translationId => {
          return '--';
        }
      }
    });

    // this.props.dispatch(initialize(languages));
    this.downloadLang();
  }

  render() {
    // console.log(this.props)
    return (
      <div>
        {this.props.routes[1].isNoWrap ? false : <Header />}
        {this.props.children}
        {this.props.routes[1].isNoWrap ? false : <Footer />}

        <ModalContainer />
      </div>
    );
  }
}

export default withLocalize(App);
//
// const mapStateToProps = state => {
//   messages:state.messages
// };
//
// export default connect(mapStateToProps)(App);
