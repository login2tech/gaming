import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';

import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';

class EditFaq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      title: '',
      content: ''
    };
  }

  componentDidMount() {
    this.process();
  }
  process() {
    const dt = this.props.data;
    if (this.props.data) {
      this.setState({
        title: dt.title,
        content: dt.content,
        id: dt.id
      });
    }
  }

  doClose() {
    this.props.dispatch({
      type: 'CLEAR_MESSAGES'
    });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'newgame'
        })
      );
    }, 500);
  }

  finalSubmit() {
    Fetcher.post('/api/faq/edit', {
      title: this.state.title,
      content: this.state.content,
      id: this.state.id
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
          this.setState({
            loaded: true
          });
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

  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });

    this.finalSubmit();
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
                <label>FAQ Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  name="title"
                  onChange={this.handleChange.bind(this)}
                  id="title"
                  value={this.state.title}
                />
              </div>
              <br />
              <div className="input-control">
                <label>FAQ Content</label>
                <textarea
                  type="text"
                  required
                  className="form-control"
                  name="content"
                  onChange={this.handleChange.bind(this)}
                  id="content"
                  value={this.state.content}
                />
              </div>

              <br />

              <input
                value="Edit FAQ Item"
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

export default connect(mapStateToProps)(EditFaq);
