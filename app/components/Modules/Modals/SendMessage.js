import {closeModal, openModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import Messages from '../Messages';
import {sendDM} from '../../../actions/orders';

import React from 'react';
class SendMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problem_content: '',
      loaded: true,
      new_msg: ''
    };
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'chat_'
      })
    );
  }

  submitData(event) {
    event.preventDefault();
    this.setState({
      loaded: false
    });

    if (this.state.new_msg.trim() == '') {
      return;
    }
    this.props.dispatch(
      sendDM(this.state.new_msg, this.props.data, null, json => {
        this.doClose();
        this.props.dispatch({type: 'CLEAR_MESSAGES'});
        this.props.dispatch(
          openModal({
            id: 'trello_snack',
            type: 'snackbar',
            zIndex: 1076,
            content: Array.isArray(json) ? json[0].msg : json.msg
          })
        );
        setTimeout(() => {
          this.props.dispatch(
            closeModal({
              id: 'trello_snack'
            })
          );
        }, 5000);
      })
    );
  }

  handleChange(event) {
    // const name = event.target.name;
    this.setState({[event.target.name]: event.target.value}, () => {});
  }

  render() {
    return (
      <div className="">
        {this.state.loaded ? (
          false
        ) : (
          <div className="show_loader">
            <div className="is_loader" />
          </div>
        )}

        {this.state.submitStatus == 1 ? (
          <div>
            <div className="modal-body">
              <Messages messages={this.props.messages} />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => this.doClose()}
                className="btn"
                tabIndex="30"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={event => {
              this.submitData(event);
            }}
          >
            <div className="modal-body">
              <Messages messages={this.props.messages} />

              <div className="form-group form-check">
                <label>Send Message</label>
                <textarea
                  className="form-control"
                  type="type"
                  autoFocus
                  required
                  placeholder="Write your message here ..."
                  value={this.state.new_msg}
                  onChange={this.handleChange.bind(this)}
                  id="new_msg"
                  name="new_msg"
                  // tabIndex="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => this.doClose()}
                className="btn text-white"
                tabIndex="30"
                data-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={this.state.new_msg == ''}
                className="btn btn-cta btn-primary btn-post"
              >
                Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(SendMessage);
