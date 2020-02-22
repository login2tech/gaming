import React from 'react';
// import {connect} from 'react-redux';
import {charge} from '../../../../actions/stripe';
// import Messages from '../../../Modules/Messages';
// import moment from 'moment';
import PaymentModal from '../../../Modules/Modals/PaymentModal';
import {openModal, closeModal} from '../../../../actions/modals';

// import {Li nk} from 'react-router';

export function openBuyPopup(id, heading, amount, return_data, disable_ocg) {
  this.props.dispatch(
    openModal({
      type: 'custom',
      id: id,
      zIndex: 534,
      heading: heading,
      content: (
        <PaymentModal
          msg=""
          modal_id={id}
          amount={amount}
          disable_ocg={disable_ocg ? disable_ocg : false}
          returnDataToEvent={return_data}
          onGetToken={(token, return_data) => {
            scrollToTop();
            this.props.dispatch(
              closeModal({
                id: id
              })
            );
            this.props.dispatch(
              openModal({
                id: 'trello_snack',
                type: 'snackbar',
                zIndex: 1076,
                content: 'please wait...'
              })
            );
            this.token_received(token, return_data);
          }}
        />
      )
    })
  );
}
export function token_received(token, return_data) {
  if (token != 'USE_OCG' && token != 'USE_PAYPAL') {
    token = token.id;
  }
  this.props.dispatch(
    charge(
      {
        stripe_token: token,
        points_to_add: return_data.points,
        init_transaction_mode: return_data.type
      },
      this.props.token,
      res => {
        if (res) {
          this.setState(
            {
              showing: 'actions'
            },
            () => {
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          );
        } else {
          this.setState({clicked: false}, () => {
            scrollToTop();
          });
        }
      }
    )
  );
}
