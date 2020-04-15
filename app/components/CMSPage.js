import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

import NotFound from './Pages/NotFound';

class CMSPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {page_loaded: false, is_page: true, title: '', content: ''};
  }

  componentWillUnmount() {
    // this.serverRequest.abort();
  }
  componentDidMount() {
    fetch('/api/cms_pages/slug/' + this.props.params.slug)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_page: true,
            is_loaded: true,
            title: json.cms_page.title,
            content: json.cms_page.content
          });
          setTimeout(function(){
            if(window.location.hash && window.location.hash!='#')
            if(document.getElementById(window.location.hash.replace('#', '')))document.getElementById(window.location.hash.replace('#', '')).scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          }, 200)
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }

  render() {
    if (this.state.is_loaded && !this.state.is_page) {
      return <NotFound />;
    }
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.state.title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row cms">
              <div
                className={
                  this.props.params.slug == 'about' ||
                  this.props.params.slug == 'about-us'
                    ? 'has-shadow col-md-8 offset-md-2 p-5 col-sm-12 col-xs-12 text-center text-bold'
                    : 'col-md-12 col-sm-12 col-xs-12'
                }
              >
                <div dangerouslySetInnerHTML={{__html: this.state.content}} />
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

export default connect(mapStateToProps)(CMSPage);
