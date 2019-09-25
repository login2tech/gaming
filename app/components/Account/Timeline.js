import React from 'react';
import {connect} from 'react-redux';
import Timeline from '../Social/Timeline';
import ProfileHeader from './ProfileHeader';
import NewPost from './NewPost';
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info: {
        first_name: ' ',
        last_name: ' ',
        followers: [],
        teams: [],
        xp_obj: [],
        score: []
      },
      renderTab: 'profile',
      match_played: [],
      new_post_type: 'text',
      new_post_image: '',
      new_post_video: '',
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
    }, 500);
    this.fetchUserInfo(true);
  }

  fetchUserInfo(forward) {
    fetch('/api/user_info?uid=' + this.props.params.username)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              user_info: json.user_info
            },
            () => {
              if (forward) {
                this.fetchPosts();
              }
            }
          );
        }
      });
  }

  fetchPosts() {
    // console.log(this.props.user);
    if (!this.props.user) {
      return;
    }
    this.setState({
      new_posting: true
    });
    fetch(
      '/api/posts/list/my?uid=' +
        this.state.user_info.id +
        '&page=' +
        this.state.posts_page
    )
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              posts: json.items,
              new_posting: false
            },
            () => {
              //     this.fetchMatches();
            }
          );
        }
      });
  }

  tags = [1, 2, 3, 4, 5];
  tag_names = [
    '',
    'Xbox Live Gamertag',
    'PSN',
    // 'Username',
    'Epic Games Username',
    'Steam Username',
    'Battletag'
  ];

  render() {
    return (
      <div>
        <ProfileHeader
          user_info={this.state.user_info}
          current_tab="timeline"
        />

        <section className="contet_part single_match_details">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="row">
                  <div className="col-md-8 offset-md-2">
                    <NewPost
                      user_info={this.state.user_info}
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
                    <br />
                    <h4 className="text-white">Latest Posts</h4>
                    <ul className="timeline">
                      {this.props.user ? (
                        false
                      ) : (
                        <div className="alert alert-warning">
                          You need to be logged in to see the posts
                        </div>
                      )}
                      {this.props.user &&
                        this.state.posts &&
                        this.state.posts.map((post, i) => {
                          return (
                            <Timeline
                              post={post}
                              key={post.id}
                              show_option_to_pin
                            />
                          );
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

export default connect(mapStateToProps)(Profile);
