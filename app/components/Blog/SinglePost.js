import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
const moment = require('moment');
class Single extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post: false
    };
  }

  componentWillUnmount() {
    this.serverRequest && this.serverRequest.abort();
    // this.serverRequest2 && this.serverRequest2.abort();
  }

  componentDidMount() {
    this.runQuery(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.runQuery(newProps);
  }

  runQuery(prps) {
    this.serverRequest = $.get(
      '/api/posts/single/' + prps.params.id + '?do_add_view=yes',
      function(result) {
        if (result.ok) {
          var obj = {
            post: result.blogpost
          };
        } else {
          var obj = {
            post: false
          };
        }
        this.setState(obj);
      }.bind(this)
    );
  }

  render() {
    const post = this.state.post;
    return (
      <div className="wrapp-content">
        <main className="content-row">
          <div className="content-box-01 single-post">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="blog-listing">
                    {post ? (
                      <article className="blog-post">
                        <h3 className="blog-post__title">{post.title}</h3>
                        <div className="blog-post__meta">
                          <ul className="blog-post__meta-list">
                            <li>
                              <p className="blog-post__meta-date">
                                {moment(post.created_at).format('llll')}
                              </p>
                            </li>
                            <li>
                              <p className="blog-post__meta-category">
                                {post.category.title}
                              </p>
                            </li>
                            {/* <li>
                                  <p className="blog-post__meta-comments">7 Comments</p>
                                </li> */}
                          </ul>
                        </div>
                        {/* <hr /> */}
                        {post.image_url ? (
                          <figure className="blog-post__img">
                            <img
                              src={'/downloads' + post.image_url}
                              alt={post.title}
                            />
                          </figure>
                        ) : (
                          false
                        )}

                        <div className="blog-post__text">
                          <div
                            dangerouslySetInnerHTML={{__html: post.content}}
                          />
                        </div>
                        {/* <div className="blog-post__btn-wrapp">
                              <Link to={linkto} className="blog-post__btn">Read More</Link>
                            </div> */}
                      </article>
                    ) : (
                      <p>The post you are looking for does no exist.</p>
                    )}
                  </div>
                  {/* <Sidebar /> */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user
    // messages: state.messages
  };
};

export default connect(mapStateToProps)(Single);
