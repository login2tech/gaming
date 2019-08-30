import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class ReplyTicket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: true, text: '' };
  }


   doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'replyticket'
        })
      );
    }, 500);
  } 
  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });

    Fetcher.post('/api/ticket_replies/add', {
      text: this.state.text,
      ticket_id: this.props.id,
       
    })
      .then(resp => {
        if (resp.ok) {
          this.props.onComplete && this.props.onComplete();
          this.doClose();
          this.setState({
            loaded: true
          });
        } else {
          this.props.dispatch({type: 'FAILURE', messages: [resp]});
        }
      })
      .catch(err => {
        // console.log(err);
        this.setState({
          loaded: true
        });
        const msg = 'Failed to perform Action';
        this.props.dispatch({
          type: 'FAILURE',
          messages: [{msg: msg}]
        });
      });
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    // const {data} = this.props;
    // console.log(data);
    return (
      <div className="">
        {this.state.loaded ? (
          false
        ) : (
          <div className="show_loader">
            <div className="is_loader" />
            sdf
          </div>
        )}
        <div>
          <div className="modal-body report_left_inner more_info_de">
            <form
              onSubmit={e => {
                this.onSubmit(e);
              }}
            >
              <Messages messages={this.props.messages} />
              <div className="input-control">
                <label>Reply Text</label>
                <textarea
                  type="text"
                  required
                  className="form-control"
                  name="text"
                  onChange={this.handleChange.bind(this)}
                  id="text"
                  value={this.state.text}
                />
              </div>
              <br />
               
              <input
                value="Create Game"
                type="submit"
                className="btn btn-primary"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    modals: state.modals.modals,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(ReplyTicket);
