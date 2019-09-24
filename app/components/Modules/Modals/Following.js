import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import Messages from '../../Messages';
import {Link} from 'react-router';

import React from 'react';
// import {connect} from 'react-redux';
// import {deleteQuestion} from '../../../actions/submissionActions';
class Following extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
  }
  fetchUserInfo(forward) {
    fetch('/api/user_info/following/list?uid=' + this.props.uid)
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
        <table>
          <tbody>
            {this.state.items.map((item, i) => {
              const image_url =
                item.user && item.user.profile_picture
                  ? item.user.profile_picture
                  : 'https://ui-avatars.com/api/?size=30&name=' +
                    (item.user ? item.user.first_name : ' ') +
                    ' ' +
                    (item.user ? item.user.last_name : ' ') +
                    '&color=223cf3&background=000000';

              return (
                <tr key={item.id}>
                  <td>
                    <Link
                      onClick={() => {
                        this.props.dispatch(
                          closeModal({
                            id: 'following'
                          })
                        );
                      }}
                      className="image_avar"
                      to={item.user ? '/u/' + item.user.username : '#'}
                    >
                      <img className="img-circle " src={image_url} />@
                      {item.user.username}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default connect(mapStateToProps)(Following);
