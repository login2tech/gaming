import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

import NotFound from './Pages/NotFound';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillUnmount() {
    // this.serverRequest.abort();
  }
  componentDidMount() {
    // fetch('/api/cms_pages/slug/' + this.props.params.slug)
    //   .then(res => res.json())
    //   .then(json => {
    //     if (json.ok) {
    //       this.setState({
    //         is_page: true,
    //         is_loaded: true,
    //         title: json.cms_page.title,
    //         content: json.cms_page.content
    //       });
    //     } else {
    //       this.setState({
    //         is_page: false,
    //         is_loaded: true
    //       });
    //     }
    //   });
  }

  render() {
    if (this.state.is_loaded && !this.state.is_page) {
      return <NotFound />;
    }
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.props.params.title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  //dfsfsdfsd sfs
                  dfsdfsdfsdjduehr8gher8ghe8rghe8rhge78rhg78ehrg78
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  //dfsfsdfsd sfs
                  dfsdfsdfsdjduehr8gher8ghe8rghe8rhge78rhg78ehrg78
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  //dfsfsdfsd sfs
                  dfsdfsdfsdjduehr8gher8ghe8rghe8rhge78rhg78ehrg78
                </div>
              </div>
              <div className="col-md-6 col-sm-12 col-xs-12">
                <div>
                  //dfsfsdfsd sfs
                  dfsdfsdfsdjduehr8gher8ghe8rghe8rhge78rhg78ehrg78
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return state;
};

export default connect(mapStateToProps)(Game);
