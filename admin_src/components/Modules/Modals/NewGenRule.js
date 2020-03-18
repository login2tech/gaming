import {closeModal} from '../../../actions/modals.js';
import {connect} from 'react-redux';

import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
// import ReactTrixEditor from 'react-trix-editor';

class NewGenRule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      title: '',
      category: '',
      content: ''
    };

    this.handleChangeTrix = this._handleChangeTrix.bind(this);
    this.handleInitTrix = this._handleInitTrix.bind(this);
  }

  componentDidMount() {
    this._editor = document.getElementById('trix_ask');
    this._editor.addEventListener('trix-initialize', this.handleInitTrix);
    this._editor.addEventListener('trix-change', this.handleChangeTrix);
  }

  _handleChangeTrix(event, is_init) {
    const obj = {content: event.target.innerHTML};
    this.setState(obj);
  }

  _handleInitTrix(event) {
    this._handleChangeTrix(event, true);
    const a = document.getElementsByTagName('trix-toolbar');
    if (a.length > 0) {
      const b = a[0].getElementsByTagName('button');
      for (let i = 0; i < b.length; i++) {
        b[i].tabIndex = -1;
      }
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      this._editor.removeEventListener('trix-initialize', this.handleInitTrix);
      this._editor.removeEventListener('trix-change', this.handleChangeTrix);
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
    Fetcher.post('/api/genrule/add', {
      title: this.state.title,
      category: '-',
      content: this.state.content
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
  onChange(content) {
    this.setState({
      content
    });
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
                <label>Rule Title</label>
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
                <label>Rule Content</label>
                <div className="form-group trix-container">
                  <input
                    id="content"
                    name="content"
                    className="form-control"
                    hidden="True"
                    type="hidden"
                  />
                  <trix-editor
                    id="trix_ask"
                    classname="trix-content"
                    autofocus
                    input="content"
                    placeholder="Add more details here..."
                  />
                </div>
              </div>

              <br />
              <input
                value="Create Rule"
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

export default connect(mapStateToProps)(NewGenRule);
