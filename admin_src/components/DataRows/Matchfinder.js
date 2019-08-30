import React from 'react';
import {connect} from 'react-redux';
import Fetcher from '../../actions/Fetcher';
import moment from 'moment';
import Messages from '../Messages';
import ReactPaginate from 'react-paginate';

class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loaded: false,
      page: 1,
      items: [],
      refresh  :false,
      pagination: {},
      showing_for  :props.params && props.params.team_id ? props.params.team_id : 'all'
    };
  }
  

  handlePageClick = data => {
    // console.log(data)
    let selected = parseInt(data.selected) + 1;
    this.setState({ page: selected }, () => {
      this.loadData();
    });
  };


  static getDerivedStateFromProps(props, state) {
    if(state.showing_for=='all' && (!props ||!props.params||!props.params.team_id)){
      // console.log('here')
      return null;
    }
    if(props.params && props.params.team_id)
    {

      if(props.params.team_id!= state.showing_for)
      {

        return {
          refresh:true,
          page : 1
        }
      }
      return null;
    }else if(state.showing_for!='all')
    {
      
      return {
        refresh : true,page:1
      }
    }
    // console.log('here2')
    return null;
  }

    componentDidUpdate(prevProps, prevState) {
    if (this.state.refresh !== prevState.refresh) {
      this.loadData();
    }
  }



  loadData() {
    let other = '';
    other=  'related=ladder,game,team_1_info,team_2_info';
    if(this.props.params && this.props.params.team_id)
    {
      other += "&filter_team_id_for_match="+this.props.params.team_id;
    }
    Fetcher.get(
      '/api/admin/listPaged/matches?'+other+'&page=' + this.state.page
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

  resolveDispute(id , team_id) {
    let key   = 'dispute'
    this.setState(
      {
        ['update_' + key + id]: true
      },
      () => {
        Fetcher.post('/api/matches/resolveDispute', {id: id, winner: team_id})
          .then(resp => {
            this.setState({
              ['update_' + key + id]: false
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

  // deleteItem(id) {
  //   const r = confirm('Are you sure you want to delete the user? ');
  //   if (r == true) {
  //   } else {
  //   }
  //   this.setState(
  //     {
  //       ['update_' + key + id]: true
  //     },
  //     () => {
  //       Fetcher.post('/api/admin/delete/matches', {id: id})
  //         .then(resp => {
  //           this.setState({
  //              ['update_' + key + id]: false
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

  componentDidMount() {
    this.loadData();
  }

  addItem() {
    // todo
  }

  render() {
    if (!this.state.is_loaded) {
      return (
        <div className="container-fluid">
          <div className="panel">
            <div className="panel-body">
              <i className="fa fa-spinner fa-spin" style={{fontSize: 40}} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container-fluid">
        <div className="panel">
          <div className="panel-body">
            <h2 style={{padding: 0, margin: 0}}>Matches {

                this.props.params && this.props.params.team_id  ?
                ' of team #'+this.props.params.team_id : ''

            }</h2>
          </div>
        </div>
        <div className="panel">
          <div className="panel-body">
            <Messages messages={this.props.messages} />
            <table className="table  table-hover  table-responsive   table-striped table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Game</th>
                  <th>Ladder</th>
                  <th>Team 1</th>
                  <th>Team 2</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Match type</th>
                  <th>Team 1 Result</th>
                  <th>Team 2 Result</th>
                  
                  <th>Actions</th>
                  <th>Starts At</th>
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((u, i) => {
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.game.title}</td>
                        <td>{u.ladder.title}</td>
                        <td>{
                          u.result == 'team_2'  ? <span className="text-danger">{u.team_1_info.title}</span>:
                              u.result == 'team_1' ? <span className="text-success">{u.team_1_info.title}</span> : 

                          u.team_1_info.title}</td>
                        <td>{u.team_2_info ?u.result == 'team_1'  ? <span className="text-danger">{u.team_2_info.title}</span>:
                              u.result == 'team_2' ? <span className="text-success">{u.team_2_info.title}</span> : 

                          u.team_2_info.title : <span className='text-danger'>Yet to Join</span>}</td>
                        <td>
                        {u.status == 'complete' ? <span className="badge badge-success">Complete</span> : u.status }</td>
                        <td>{u.result ? 
                            u.result == 'team_2'
                              ? "Team 2 Wins"
                              : u.result=='team_1'
                                ? "Team 1 Wins"
                                : u.result =='disputed'
                                  ? (<span className="text-danger">Disputed</span>)
                                  : (<span className="text-warning">{u.result}</span>):
                                  <span className="text-warning">Yet to declare</span>}</td>
                        <td>{u.match_type== 'paid' ? ''+u.match_fee+'/- OCG CASH' : 'FREE'}</td>
                        <td>{u.team_1_result}</td>
                        
                        <td>{u.team_2_result}</td> 
                        <td>
                        <div className="dropdown">
                            <button
                              className="btn btn-primary btn-xs dropdown-toggle"
                              type="button"
                              data-toggle="dropdown"
                            >
                              Details
                              <span className="caret" />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a
                                  href={"/m/"+u.id}
                                  target='_blank'
                                >
                                  View Match Public Page
                                </a>
                              </li>
                              <li>
                                <a
                                  href={"/teams/view/"+u.team_1_info.id}
                                  target='_blank'
                                >
                                  View Team 1 Public Page
                                </a>
                              </li>
                              {
                                u.team_2_info  ? 
                                <li>
                                  <a
                                    href={"/teams/view/"+u.team_2_info.id}
                                    target='_blank'
                                  >
                                    View Team 2 Public Page
                                  </a>
                                </li> : false
                              }
                              {
                                (u.result =='disputed')? (
                                  <li>
                                <a
                                  href="#" onClick={(e)=>{
                                  e.preventDefault();
                                  this.resolveDispute(u.id, 'team_1');
                                  }}
                                
                                >
                                  Resolve dispute by giving win to team 1
                                </a>
                              </li>
                              )
                                :false

                              }

                               {
                                (u.result =='disputed')? (
                                  <li>
                                <a href="#" onClick={(e)=>{
                                  e.preventDefault();
                                  this.resolveDispute(u.id, 'team_2');
                                }}
                                
                                >
                                  Resolve dispute by giving win to team 2
                                </a>
                              </li>
                              )
                                :false

                              }
                             
                               
                            </ul>
                          </div>
                        </td>
                        <td>{moment(u.starts_at).format('lll')}</td>

                      </tr>
                    );
                  })}
              </tbody>
            </table>

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

export default connect(mapStateToProps)(MatchFinder);
