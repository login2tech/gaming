import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
// import moment from 'moment';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class ModifySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      item: {},
      content: ''
    };
  }

  process() {
    // const dt = this.props.data;
    if (this.props.data) {
      this.setState({
        item: this.props.data,
        content: this.props.data.content
      });
    }
  }

  doClose() {
    // this.props.dispatch({
    //   type: 'CLEAR_MESSAGES'
    // });
    setTimeout(() => {
      this.props.dispatch(
        closeModal({
          id: 'profile'
        })
      );
    }, 500);
  }

  componentDidMount() {
    this.loadData();
    this.process();
  }
  loadData() {
    Fetcher.get(
      '/api/admin/listPaged/games?per_page=10000&page=' + this.state.page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            loaded: true,
            games: resp.items,
            pagination: resp.pagination ? resp.pagination : {}
          });
        } else {
          this.props.dispatch({
            type: 'FAILURE',
            messages: [resp]
          });
        }
      })
      .catch(err => {
        // console.log(err);
        const msg = 'Failed to load users';
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

    Fetcher.post('/api/admin/update/settings', {
      id: this.state.item.id,
      data: {
        content: this.state.content
      }
    })
      .then(resp => {
        if (resp.ok) {
          this.props.dispatch({type: 'SUCCESS', messages: [resp]});
          this.props.onComplete && this.props.onComplete();

          this.doClose();
          this.setState({
            loaded: true
          });
        } else {
          this.setState({
            loaded: true
          });
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
                <label>{this.state.item.label}</label>
                <input
                  type={this.state.item.type}
                  className="form-control"
                  name="content"
                  onChange={this.handleChange.bind(this)}
                  id="content"
                  value={this.state.content}
                />
              </div>
              <br />

              <br />
              <input value="Modify" type="submit" className="btn btn-primary" />
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

export default connect(mapStateToProps)(ModifySetting);
