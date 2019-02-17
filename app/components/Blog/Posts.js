import React from 'react';
import {browserHistory} from 'react-router';
import ReactPaginate from 'react-paginate';
import {connect} from 'react-redux';
// import { Link }    from 'react-router';
import SingleSnippet from './SingleSnippet.js';
// var moment = require('moment');

class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      total_items: 0,
      total_pages: 0,
      current_page: 1,
      items: []
    };
  }

  componentWillUnmount() {
    this.serverRequest && this.serverRequest.abort();
  }

  componentDidMount() {
    this.runQuery(this.props);
  }
  componentWillReceiveProps(newProps) {
    this.runQuery(newProps);
  }
  qryStr = [];
  runQuery(prps) {
    let qry = [];
    this.qryStr = [];
    // thisqryStr = [];
    if (prps.params.category_slug) {
      qry.push('category=' + prps.params.category_slug);
      this.qryStr.push(prps.params.category_slug);
    }
    if (prps.params.tag_slug) {
      qry.push('tag=' + prps.params.tag_slug);
      this.qryStr.push(prps.params.tag_slug);
    }
    if (prps.params.paged) {
      qry.push('paged=' + prps.params.paged);
      this.qryStr.push(prps.params.paged);
    }

    qry = qry.join('&');
    this.serverRequest = $.get(
      '/api/posts/listPaged?' + qry,
      function(result) {
        if (result.ok) {
          var obj = {
            items: result.items,
            is_loaded: true,
            total_items: result.pagination.rowCount,
            total_pages: result.pagination.pageCount,
            current_page: result.pagination.page
          };
        } else {
          var obj = {
            items: [],
            is_loaded: true,
            total_items: 0,
            total_pages: 0,
            current_page: 1
          };
        }
        this.setState(obj);
      }.bind(this)
    );
  }

  handlePageClick(i) {
    //  console.log(i)
    const page = i.selected + 1;
    const cat = this.props.params.category_slug;
    if (cat) {
      browserHistory.push('/blog/' + cat + '/p/' + page);
    } else {
      browserHistory.push('/blog/p/' + page);
    }
  }

  render() {
    return (
      <div className="wrapp-content">
        <main className="content-row">
          <div className="content-box-01 single-post">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="blog-listing">
                    {this.state.is_loaded && this.state.items.length < 1 ? (
                      <p className="text-center">
                        No items matching your criteria
                      </p>
                    ) : (
                      false
                    )}

                    {this.state.items.map((post, i) => {
                      // console.log(post)
                      return <SingleSnippet post={post} key={i} />;
                    })}

                    {this.state.is_loaded && this.state.items.length ? (
                      <ReactPaginate
                        previousLabel={'<'}
                        nextLabel={'>'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        initialPage={this.state.current_page - 1}
                        disableInitialCallback
                        pageCount={this.state.total_pages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={i => {
                          this.handlePageClick(i);
                        }}
                        containerClassName={'pagination-list'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                      />
                    ) : (
                      false
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

export default connect(mapStateToProps)(Posts);
