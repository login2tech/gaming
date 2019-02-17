import React       from 'react';
// import { connect } from 'react-redux'
import { Link }    from 'react-router';
var moment = require('moment');

// import Messages from 'Messages';

class SingleSnippet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var post = this.props.post;
    if(!post)
      return false;
    var linkto = "/blog/post/"+post.id+'/'+post.slug;
    var linktoCategory = "/blog/category/"+post.category;
    return (
      <article className="blog-post">
        <Link to={linkto}>
          <h3 className="blog-post__title">
            {post.title}
          </h3>
        </Link>
        <div className="blog-post__meta">
          <ul className="blog-post__meta-list">
            <li>
              <p className="blog-post__meta-date">{moment(post.created_at).format('llll')}</p>
            </li>
            <li>
              <p className="blog-post__meta-category">{post.category.title}</p>
            </li>
            {/* <li>
              <p className="blog-post__meta-comments">7 Comments</p>
            </li> */}
          </ul>
        </div>
        {
          (post.image_url)?
          (
            <figure className="blog-post__img">
              <img src={'/downloads'+post.image_url} alt={post.title} />
            </figure>
          ):false
        }
        <div className="blog-post__text">
          <div dangerouslySetInnerHTML={{__html: post.short_content }}></div>
        </div>
        <div className="blog-post__btn-wrapp">
          <Link to={linkto} className="blog-post__btn">Read More</Link>
        </div>
      </article>

    );
  }
}

export default SingleSnippet;
