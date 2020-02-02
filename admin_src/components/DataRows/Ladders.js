import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
// import { updateProfile, changePassword, deleteAccount } from '../../actions/auth';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';
import {openModal} from '../../actions/modals';

import NewLadder from '../Modules/Modals/NewLadder';
import EditLadder from '../Modules/Modals/EditLadder';

class Ladders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      pagination: {}
    };
  }

  handlePageClick = data => {
    // console.log(data)
    const selected = parseInt(data.selected) + 1;
    this.setState({page: selected}, () => {
      this.loadData();
    });
  };

  loadData() {
    Fetcher.get(
      '/api/admin/listPaged/ladders?related=game_info&page=' + this.state.page
    )
      .then(resp => {
        if (resp.ok) {
          this.setState({
            is_loaded: true,
            items: resp.items,
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

  // updateItem(id, data, key) {
  //   this.setState(
  //     {
  //       ['update_' + key + id]: true
  //     },
  //     () => {
  //       Fetcher.post('/api/admin/update/users', {id: id, data: data})
  //         .then(resp => {
  //           this.setState({
  //             ['update_' + key + id]: false
  //           });
  //           if (resp.ok) {
  //             this.loadData();
  //           } else {
  //             this.props.dispatch({type: 'FAILURE', messages: [resp]});
  //           }
  //         })
  //         .catch(err => {
  //           console.log(err);
  //           const msg = 'Failed to perform Action';
  //           this.props.dispatch({
  //             type: 'FAILURE',
  //             messages: [{msg: msg}]
  //           });
  //         });
  //     }
  //   );
  // }

  deleteItem(id) {
    // const k = '';
    const r = confirm('Are you sure you want to delete the ladder? ');
    // console.log(r)
    if (r == true) {
      //
    } else {
      return;
    }
    this.setState(
      {
        ['update_' + id]: true
      },
      () => {
        Fetcher.post('/api/admin/delete/ladders', {id: id})
          .then(resp => {
            this.setState({
              ['update_' + id]: false
            });
            if (resp.ok) {
              this.loadData();
            } else {
              this.props.dispatch({type: 'FAILURE', messages: [resp]});
            }
          })
          .catch(err => {
            console.log(err);
            const msg = 'Failed to perform Action';
            this.props.dispatch({
              type: 'FAILURE',
              messages: [{msg: msg}]
            });
          });
      }
    );
  }

  componentDidMount() {
    this.loadData();
  }
  editItem(id, data) {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'newgame',
        zIndex: 534,
        heading: 'Edit Ladder',
        content: (
          <EditLadder
            mode={'edit'}
            id={id}
            data={data}
            onComplete={this.loadData.bind(this)}
          />
        )
      })
    );
  }

  addItem() {
    this.props.dispatch(
      openModal({
        type: 'custom',
        id: 'newladder',
        zIndex: 534,
        heading: 'New Ladder',
        content: <NewLadder onComplete={this.loadData.bind(this)} />
      })
    );
  }

  gamer_tags = {
    tag_1: 'Xbox Live Gamertag',
    tag_2: 'PSN',
    tag_3: 'Epic Games Username',
    tag_4: 'Steam Username',
    tag_5: 'Battletag',
    tag_6: 'Activision ID'
  };
  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="container">
          <div className="panel">
            <div className="panel-body">
              <i className="fa fa-spinner fa-spin" style={{fontSize: 40}} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container">
        <div className="panel">
          <div className="panel-body">
            <div className="text-right pull-right push-right align-right">
              <button
                className="btn btn-success btn-xs"
                onClick={this.addItem.bind(this)}
              >
                <i className="fa fa-plus" /> Add new Ladder
              </button>
            </div>
            <h2 style={{padding: 0, margin: 0}}>Ladders</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <div className="table-responsive"><table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Game</th>
                  <th>Platform</th>
                  <th>Min Players</th>
                  <th>Max Players</th>
                  <th>Gamer Tag Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.title}</td>
                        <td>{u.game_info && u.game_info.title}</td>
                        <td>{u.platform}</td>

                        <td>{u.min_players}</td>
                        <td>{u.max_players}</td>
                        <td>{this.gamer_tags['tag_' + u.gamer_tag]}</td>
                        <td>
                          <a
                            href={
                              '/admin/#/teams/filter/' + u.id + '/' + u.title
                            }
                            className="btn btn-primary btn-xs"
                          >
                            View Teams
                          </a>{' '}
                          <button
                            onClick={() => {
                              this.editItem(u.id, u);
                            }}
                            className="btn btn-warning btn-xs"
                          >
                            {this.state['update_' + u.id] ? (
                              <i className="fa fa-spinner fa-spin" />
                            ) : (
                              false
                            )}{' '}
                            Edit
                          </button>{' '}
                          <button
                            onClick={() => {
                              this.deleteItem(u.id);
                            }}
                            className="btn btn-danger btn-xs"
                          >
                            {this.state['update_' + u.id] ? (
                              <i className="fa fa-spinner fa-spin" />
                            ) : (
                              false
                            )}{' '}
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table></div>

            <ReactPaginate
              previousLabel={'previous'}
              nextLabel={'next'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={this.state.pagination.pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(Ladders);
