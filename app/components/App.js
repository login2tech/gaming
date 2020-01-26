import React from 'react';
import Header from './Modules/Header';
import Footer from './Modules/Footer';
import {connect} from 'react-redux';
import moment from 'moment';
import ModalContainer from './ModalContainer';

// import {withLocalize} from 'react-localize-redux';

class App extends React.Component {
  loadLang() {}
  state = {
    canShowPlatformNotice: false
  };

  componentDidMount() {
    this.canShowPlatformNotice();
  }

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

  canShowPlatformNotice() {
    const a = window.localStorage.getItem('pnotice_snoozed_till');
    if (a == this.props.settings.platform_notice) {
      this.setState({
        canShowPlatformNotice: false
      });
      return;
    }
    this.setState({
      canShowPlatformNotice: true
    });
  }
  snoozePlatformNotice() {
    window.localStorage.setItem(
      'pnotice_snoozed_till',
      this.props.settings.platform_notice
    );
    this.setState({
      canShowPlatformNotice: false
    });
  }

  render() {
    // console.log(this.props)
    return (
      <div>
        {this.props.routes[1].isNoWrap ? false : <Header />}
        {this.props.children}
        {this.props.routes[1].isNoWrap ? false : <Footer />}
        <div className="backtotop" id="backtotop">
          <span
            className="fa fa-arrow-up"
            onClick={() => {
              scrollToTop();
            }}
          />
        </div>

        {this.props.settings.platform_notice &&
        this.state.canShowPlatformNotice ? (
          <>
            <div className="alert alert-warning p-4 platform_notice m-0">
              <button
                className="btn btn-primary max-width-200 float-right btn-sm mr-4"
                onClick={this.snoozePlatformNotice.bind(this)}
              >
                Close
              </button>
              {this.props.settings.platform_notice}
            </div>
          </>
        ) : (
          false
        )}
        <ModalContainer />
      </div>
    );
  }
}

// const App2 = withLocalize(App);
//
const mapStateToProps = state => {
  return {
    // token: state.auth.token,
    settings: state.settings
    // userHash: state.auth.userHash
  };
};

export default connect(mapStateToProps)(App);
