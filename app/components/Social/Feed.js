import React from 'react';
import {connect} from 'react-redux';
// import {Link} from 'react-router';
// import moment from 'moment';
// import {add_post, add_friend} from '../../actions/social';
// import axios from 'axios';
import Timeline from '../Social/Timeline';
class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      posts_page: 1
    };
  }

  componentDidMount() {
    setTimeout(function() {
      const element = document.getElementById('is_top');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }, 1000);
    this.fetchPosts();
  }

  fetchPosts() {
    // console.log(this.props.params);
    let hashtag = this.props.params ? this.props.params.hashtag : '';
    if (!hashtag) {
      hashtag = '';
    }
    fetch(
      '/api/posts/list/all?hastag=' + hashtag + '&page=' + this.state.posts_page
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              posts: json.items
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar less_padding" id="is_top">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>Social Feed</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="row">
                  <div className="col-md-8 offset-md-2">
                    <h4 className="text-white">Latest Posts</h4>
                    <ul className="timeline">
                      {this.state.posts &&
                        this.state.posts.map((post, i) => {
                          return <Timeline post={post} key={post.id} />;
                        })}
                    </ul>
                  </div>
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
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Feed);
