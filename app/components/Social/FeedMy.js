import React from 'react';
import {connect} from 'react-redux';
import NewPost from '../Account/NewPost';

import Timeline from '../Social/Timeline';
class FeedMy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      pagination: {},
      loading: false,
      loaded: false,
      posts_page: 1,
      has_new_posts: false
    };
  }
  checkNewPosts() {
    $.get('/api/posts/latestTimestamp?type=my', result => {
      if (result == 'yes') {
        this.setState({
          has_new_posts: true
        });
      } else {
        this.setState({
          has_new_posts: false
        });
      }
    });
  }

  componentWillUnMount() {
    clearInterval(this.inrvl);
  }

  componentDidMount() {
    this.inrvl = setInterval(this.checkNewPosts, 60000);
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
    this.setState({
      loading: true
    });
    fetch('/api/posts/list/myfeed?page=' + this.state.posts_page)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              posts: this.state.posts.concat(json.items),
              pagination: json.pagination ? json.pagination : {},
              loading: false,
              loaded: true
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
                  <h3>Social Feed - My following</h3>
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
                    <NewPost
                      is_private
                      user_info={this.props.user}
                      onSubmit={post => {
                        const posts = this.state.posts;
                        posts.unshift(post);
                        this.setState({
                          posts: posts,
                          new_post_type: 'text',
                          new_post_image: '',
                          new_post_video: '',
                          new_post_content: ''
                        });
                      }}
                    />
                    {this.state.loaded && this.state.posts.length == 0 ? (
                      <div className="alert alert-warning">
                        No posts to show on this page{' '}
                      </div>
                    ) : (
                      false
                    )}
                    {this.state.has_new_posts ? (
                      <a className="alert alert-primary" href="/feed">
                        New posts available. Click to refresh feed
                      </a>
                    ) : (
                      false
                    )}
                    <ul className="timeline">
                      {this.state.posts &&
                        this.state.posts.map((post, i) => {
                          return <Timeline post={post} key={post.id} />;
                        })}
                    </ul>

                    <div className="text-center">
                      {this.state.loading ? (
                        <span className="fa fa-spin fa-spinner text-white" />
                      ) : this.state.pagination.pageCount >
                      this.state.posts_page ? (
                        <button
                          onClick={() => {
                            this.setState(
                              {
                                posts_page: this.state.posts_page + 1
                              },
                              () => {
                                this.fetchPosts();
                              }
                            );
                          }}
                          className="btn-outline text-white"
                        >
                          load more <span className="fa fa-angle-right" />
                        </button>
                      ) : (
                        false
                      )}
                    </div>
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

export default connect(mapStateToProps)(FeedMy);
