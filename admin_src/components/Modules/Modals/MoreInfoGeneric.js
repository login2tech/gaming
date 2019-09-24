import {closeModal} from '../../../actions/modals';
import {connect} from 'react-redux';

import React from 'react';
class MoreInfoGeneric extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  doClose() {
    this.props.dispatch(
      closeModal({
        id: 'mode_info'
      })
    );
  }

  render() {
    const {data} = this.props;
    const keys = Object.keys(data);
    return (
      <div className="">
        <div>
          <div className="modal-body report_left_inner more_info_de">
            <table className="table table-stripped">
              <tbody>
                {keys.map((key, i) => {
                  return (
                    <tr key={key}>
                      <td>
                        <strong>{key}</strong>
                      </td>
                      <td>{data[key]}</td>
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
  return {};
};

export default connect(mapStateToProps)(MoreInfoGeneric);
