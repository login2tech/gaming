import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import axios from 'axios';
import Fetcher from '../../../actions/Fetcher';
import Messages from '../../Messages';
import React from 'react';
class ModifySetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: true,
      item: {},
      content: ''
    };
    this.banner_url_ref = React.createRef();
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
    this.process();
  }




  finalSubmit() {
     this.setState({
      loaded: false
    });

    Fetcher.post('/api/admin/update/settings', {
      id: this.state.item.id,
      data: {
        content: this.state.banner_url
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




  onSubmit(e) {
    e.preventDefault();
    this.setState({
      loaded: false
    });
    if(this.state.item.type == 'file')
    {


      const data = new FormData();
      const node = this.banner_url_ref.current;
      const file_1 = node.files[0];
      data.append('file', file_1, file_1.name);
      axios
      .post('/upload', data, {
        onUploadProgress: ProgressEvent => {
          //
        }
      })
      .then(res => {
        this.setState(
          {
            banner_url: res.data.file
          },
          () => {
            this.finalSubmit();
          }
        );
      })
      .catch(err => {
        alert('some error occoured.');
        this.setState({
          loaded: true
        });
      });

      return false;
    }

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
                {

                  (this.state.item.key == "clip_day_text" ||
                  this.state.item.key == "clip_month_text" ||
                  this.state.item.key == "clip_week_text" )
                  ?

                  <textarea
                    className="form-control"
                    name="content"
                    onChange={this.handleChange.bind(this)}
                    id="content"
                    value={this.state.content}
                  />

                :

                <input
                  type={this.state.item.type}
                  className="form-control"
                  name="content"
                  ref={this.banner_url_ref}
                  onChange={this.handleChange.bind(this)}
                  id="content"
                  value={this.state.item.type =='file' ? '' :this.state.content}
                />


                }

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
