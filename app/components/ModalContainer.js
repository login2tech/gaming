import {connect} from 'react-redux';
import React from 'react';
import {closeModal} from '../actions/modals';

class Modal extends React.Component {
  onClose() {
    if (this.props.item.onClose) {
      this.props.item.onClose();
      this.props.onClose(this.props.item);
    } else {
      this.props.onClose(this.props.item);
    }
  }

  onConfirm() {
    if (this.props.item.onConfirm) {
      this.props.item.onConfirm();
      this.props.onClose(this.props.item);
    }
  }

  render() {
    // const {zIndex, id} = this.props;
    const {type} = this.props.item;
    if (type === 'custom') {
      const {content} = this.props.item;
      return (
        <div
          className="modal must_show"
          id={'modal_' + this.props.item.id}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{zIndex: this.props.item.zIndex + 2}}
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.props.item.heading}</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => this.onClose()}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              {content}
            </div>
          </div>
        </div>
      );
    } else if (type == 'snackbar') {
      return (
        <div id={'snack_' + this.props.item.id} className="snackbar">
          {this.props.item.content}{' '}
          {this.props.item.link ? (
            <a href={this.props.item.link} target="_blank">
              {this.props.item.link_label}
            </a>
          ) : (
            false
          )}
        </div>
      );
    }
    return <div />;
  }
}

class Modals extends React.Component {
  render() {
    const modals = this.props.modals.map((item, i) => (
      <Modal
        item={item}
        key={item.id}
        zIndex={i}
        onClose={item => this.props.dispatch(closeModal(item))}
      />
    ));
    return <div className={modals.length > 0 ? 'modals' : ''}>{modals}</div>;
  }
}

const ModalContainer = connect(
  function mapStateToProps(state) {
    return {
      modals: state.modals.modals
    };
  },
  function mapDispatchToProps(dispatch) {
    return {
      dispatch
    };
  }
)(Modals);

export default ModalContainer;
