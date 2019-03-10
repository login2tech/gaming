import React from 'react';
// import {connect} from 'react-redux';
// import { resetPassword } from '../../actions/auth';
// import Messages from 'Messages';

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
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>{this.props.params.title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <table
                  id="threads-table"
                  className="table table-striped table-gray"
                >
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
                            <a href={'/forums/thread/' + item.id + '/page/1/'}>
                              {item.title}
                            </a>
                          </td>
                          <td className="lb-user">
                            <div className="lb-userimg">
                              <a href={'/u/' + item.user.username}>
                                {<img src={item.user.gravatar} />}
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
