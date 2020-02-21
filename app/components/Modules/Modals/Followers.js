import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import Messages from '../../Messages';
import {Link} from 'react-router';

import React from 'react';
// import {connect} from 'react-redux';
// import {deleteQuestion} from '../../../actions/submissionActions';
class Followers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
  }
  fetchUserInfo(forward) {
    fetch('/api/user_info/followers/list?uid=' + this.props.uid)
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          this.setState({
            is_loaded: true,
            items: json.items
          });
        }
      });
  }
  componentDidMount() {
    this.fetchUserInfo();
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="modal-body">
          <span className="fa fa-spinner fa-spin spin" />
        </div>
      );
    }
    return (
      <div className="modal-body">
        <div className="table_wrapper">
          <table className="table">
            <tbody>
              {this.state.items.map((item, i) => {
                const image_url =
                  item.follower && item.follower.profile_picture
                    ? item.follower.profile_picture
                    : 'https://ui-avatars.com/api/?size=30&name=' +
                      (item.follower ? item.follower.first_name : ' ') +
                      ' ' +
                      (item.follower ? item.follower.last_name : ' ') +
                      '&color=223cf3&background=000000';

                return (
                  <tr key={item.id}>
                    <td>
                      <Link
                        className="image_avar"
                        onClick={() => {
                          this.props.dispatch(
                            closeModal({
                              id: 'followers'
                            })
                          );
                        }}
                        to={
                          item.follower ? '/u/' + item.follower.username : '#'
                        }
                      >
                        <img className="img-circle " src={image_url} />@
                        {item.follower.username}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {this.state.is_loaded && this.state.items.length < 1 && (
          <div className="alert alert-warning">No Users in this list</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps)(Followers);
