import React from 'react';
import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

class NewTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {page_loaded: false, is_page: true, title: '', content: ''};
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
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
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
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
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
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};
// export default SingleThread;
export default connect(mapStateToProps)(NewTicket);
