// import {closeModal, openModal} from '../../../actions/modals';
// import {connect} from 'react-redux';
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
    return (
      <div className="modal-body">
        <table>
          <tbody>
            {this.state.items.map((item, i) => {
              return (
                <tr key={item.id}>
                  <td>
                    <Link to={'/u/' + item.user.username}>
                      {item.user.username}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {this.state.is_loaded &&
          this.state.items.length < 1 && (
            <div className="alert alert-warning">No Users in this list</div>
          )}
      </div>
    );
  }
}

export default Following;
