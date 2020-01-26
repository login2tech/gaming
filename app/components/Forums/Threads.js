import React from 'react';
import {Link} from 'react-router';

class Threads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page_loaded: false,
      threads: []
    };
  }

  componentWillUnmount() {
    // this.serverRequest.abort();
  }
  componentDidMount() {
    fetch('/api/thread/list?topic=' + this.props.params.id)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState(
            {
              is_loaded: true,
              threads: json.items
            },
            () => {
              // this.fetchReplies();
            }
          );
        } else {
          this.setState({
            is_page: false,
            is_loaded: true
          });
        }
      });
  }
  // fetchReplies(){
  //   var item_id =
  //   var paged = this.props.params.page
  // }

  render() {
    return (
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline m-0 white-headline text-left">
                  <h3>{this.props.params.title}</h3>
                  <h5>Topic</h5>
                  <br />
                  <br />
                  <a href="/forums" className="">
                    <span className="fa fa-arrow-left" /> back to topics
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container content_box">
            <ul
              className="nav  justify-content-end nav-tabs responsive-tabs"
              role="tablist"
              style={{marginBottom: 40}}
            >
              <li role="presentation" className="pull-right text-right" />
            </ul>

            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="table_wrapper">
                  <table className="table table-striped table-ongray table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Replies</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.threads.map((item, i) => {
                        return (
                          <tr key={item.id}>
                            <td>
                              <a
                                href={
                                  '/forums/' +
                                  this.props.params.title +
                                  '/thread/' +
                                  item.id +
                                  '/page/1/'
                                }
                              >
                                {item.title}
                              </a>
                            </td>
                            <td className="lb-user">
                              <div className="lb-userimg">
                                <a href={'/u/' + item.user.username}>
                                  <img
                                    src={
                                      item.user.profile_picture ||
                                      item.user.gravatar
                                    }
                                    style={{
                                      width: 50,
                                      height: 50,
                                      borderRadius: 25
                                    }}
                                  />
                                </a>
                                <a href={'/u/' + item.user.username}>
                                  {' '}
                                  {item.user.username}
                                </a>
                              </div>
                            </td>
                            <td>{item.thread_repliesCount} replies</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
export default Threads;
// export default connect(mapStateToProps)(Threads);
