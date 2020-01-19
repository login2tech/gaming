import React from 'react';
import {connect} from 'react-redux';

import Timeline from '../Social/Timeline';
import NewPost from '../Account/NewPost';

class Feed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      pagination: {},
      loading: false,
      posts_page: 1,
      filter: 'all',
      has_new_posts: false
    };
  }

  checkNewPosts() {
    let hashtag = this.props.params ? this.props.params.hashtag : '';
    if (!hashtag) {
      hashtag = '';
    }
    $.get(
      '/api/posts/latestTimestamp?type=global&hastag=' + hashtag,
      result => {
        if (result == 'yes') {
          this.setState({
            has_new_posts: true
          });
        } else {
          this.setState({
            has_new_posts: false
          });
        }
      }
    );
  }

  componentWillUnMount() {
    clearInterval(this.inrvl);
  }

  componentDidMount() {
    this.inrvl = setInterval(this.checkNewPosts.bind(this), 30000);
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
  fetchPostsAgain(newfilter) {
    if (this.state.filter == newfilter) {
      return;
    }
    this.setState(
      {
        refreshing: true,
        posts_page: 1,
        filter: newfilter
      },
      () => {
        this.fetchPosts(true);
      }
    );
  }
  fetchPosts(refresh) {
    // console.log(this.props.params);
    let hashtag = this.props.params ? this.props.params.hashtag : '';
    if (!hashtag) {
      hashtag = '';
    }
    let fltr = 'a=b&';
    if (this.state.filter && this.state.filter != 'all') {
      fltr = 'filter=' + this.state.filter + '&';
    }
    this.setState({
      loading: true
    });
    fetch(
      '/api/posts/list/all?' +
        fltr +
        'hastag=' +
        hashtag +
        '&page=' +
        this.state.posts_page
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          const items = refresh
            ? json.items
            : this.state.posts.concat(json.items);
          this.setState(
            {
              posts: items,
              refreshing: false,
              pagination: json.pagination ? json.pagination : {},
              loading: false
            },
            () => {
              // this.fetchMatches();
            }
          );
        }
      });
  }

  render() {
    let hashtag = this.props.params ? this.props.params.hashtag : '';
    if (!hashtag) {
      hashtag = '';
    }
    return (
      <div>
        <section className="page_title_bar noblend less_padding" id="is_top">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h4>Social Feed</h4>
                  <h3>
                    {hashtag ? (
                      <>
                        Trend - #
                        <span className="tolowercase">
                          {hashtag.toLowerCase()}
                        </span>
                      </>
                    ) : (
                      <>
                        {' '}
                        Global <span className="fa fa-globe" />
                      </>
                    )}
                  </h3>
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
                    <h4 className="text-white">
                      Latest Posts
                      {hashtag ? ' - #' + hashtag.toLowerCase() : ''}
                    </h4>

                    <NewPost
                      user_info={this.props.user}
                      onSubmit={post => {
                        const posts = this.state.posts;
                        posts.unshift(post);
                        clearInterval(this.inrvl);

                        this.inrvl = setInterval(
                          this.checkNewPosts.bind(this),
                          30000
                        );
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
                      <a
                        className="alert alert-primary new_postmsg"
                        href="/feed"
                      >
                        New posts available. Click to refresh feed
                      </a>
                    ) : (
                      false
                    )}

                    <div className="filter-form mt-3">
                      <button
                        onClick={() => {
                          this.fetchPostsAgain('all');
                        }}
                        className={
                          (this.state.filter == 'all'
                            ? 'btn-primary '
                            : 'btn-outline ') + 'btn mr-1'
                        }
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          this.fetchPostsAgain('videos');
                        }}
                        className={
                          (this.state.filter == 'videos'
                            ? 'btn-primary '
                            : 'btn-outline ') + 'btn mr-1 '
                        }
                      >
                        <span className="fa fa-video" /> Videos
                      </button>
                      <button
                        onClick={() => {
                          this.fetchPostsAgain('images');
                        }}
                        className={
                          (this.state.filter == 'images'
                            ? 'btn-primary '
                            : 'btn-outline ') + 'btn mr-1 '
                        }
                      >
                        <span className="fa fa-image" /> Images
                      </button>
                      <button
                        onClick={() => {
                          this.fetchPostsAgain('media');
                        }}
                        className={
                          (this.state.filter == 'media'
                            ? 'btn-primary '
                            : 'btn-outline ') + 'btn mr-1'
                        }
                      >
                        <span className=" fa fa-images" /> All Media
                      </button>
                    </div>
                    {this.state.refreshing ? (
                      false
                    ) : (
                      <ul className="timeline">
                        {this.state.posts &&
                          this.state.posts.map((post, i) => {
                            return <Timeline post={post} key={post.id} />;
                          })}
                      </ul>
                    )}
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

export default connect(mapStateToProps)(Feed);
