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
    fetch('/api/catalog/listForAdmin?user_id=' + data.id  ).then(
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
            <table className="table table-stripped table-bordered table-hovered table-hover">
              <thead>
                <tr>
                   
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Variant</th>
                  
                </tr>
              </thead>
              <tbody>
                {this.state.items &&
                  this.state.items.map((order, i) => {
                    return (
                      <tr>
                        <td>{order.title}</td>
                        <td>{order.brand}</td>
                        <td>{order.variant}</td>
                        
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
