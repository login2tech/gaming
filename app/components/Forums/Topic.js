import React from 'react';
// import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';
import {Link} from 'react-router';

class Topic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      topics: []
    };
  }

  componentWillUnmount() {
    // this.serverRequest.abort();
  }
  componentDidMount() {
    fetch('/api/topic/list')
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            topics: json.items
          });
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Forum</h3>
                  <p>Your place to talk about video games.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <ul className="forum_topic_list">
                  {this.state.topics.map((topic, i) => {
                    return (
                      <li key={topic.id}>
                        <Link
                          to={
                            '/forums/' +
                            topic.id +
                            '/' +
                            topic.title.toLowerCase()
                          }
                        >
                          <div className="left_topic_content">
                            <span className="fourm_time">{topic.title}</span>{' '}
                            <span className="forum_subheading">
                              {topic.sub_title}
                            </span>
                          </div>

                          <div className="right_topic_content">
                            <span className="thread_count">
                              {topic.threadsCount} threads
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

// const mapStateToProps = state => {
//   return state;
// };

export default Topic;
// export default connect(mapStateToProps)(Topic);
