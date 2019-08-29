import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';
import moment from 'moment';
import React from 'react';
class MoreInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false, items: []};
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'orders'
      })
    );
  }

  fetchData() {
    const {type, data} = this.props;
    fetch('/api/order/listForAdmin?user_id=' + data.id + '&type=' + type).then(
      response => {
        if (response.ok) {
          return response.json().then(json => {
            if (json.ok) {
              this.setState({
                items: json.items ? json.items : [],
                loaded: true
              });
            }
          });
        }
      }
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const {data} = this.props;
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
            <table className="table table-stripped table-bordered  table-hovered table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Created at</th>
                  <th>Image/List</th>
                  <th>Total Quantity</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((order, i) => {
                    return (
                      <tr>
                        <td>{order.id}</td>
                        <td>{moment(order.created_at).format('lll')}</td>
                        <td>
                          <span className="label label-default">
                            {order.is_image_based ? 'Image' : 'List'}
                          </span>
                        </td>
                        <td>
                          <span className="label label-default">
                            {order.is_image_based ? '- ' : order.total_quantity}
                          </span>
                        </td>
                        <td>{order.status}</td>
                        <td>
                          <button className="btn btn-xs btn-primary">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
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

export default connect(mapStateToProps)(MoreInfo);
