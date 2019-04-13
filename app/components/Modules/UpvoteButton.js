import React from 'react';
import {connect} from 'react-redux';
import {upVote, downVote} from '../../actions/social';

class UpvoteButton extends React.Component {
  state = {changed: false, doChange: 0};
  changeVote(already_voted, e) {
    if (already_voted) {
      this.handleDownVote(e);
    } else {
      this.handleUpVote(e);
    }
  }

  handleUpVote(e) {
    this.props.dispatch(
      upVote(
        {
          post_id: this.props.post_id
        },
        res => {
          if (res) {
            this.setState({
              changed: !this.state.changed,
              doChange: this.state.doChange + 1
            });
          }
        }
      )
    );
  }

  handleDownVote(e) {
    if (this.props.total_count == 0 && !this.state.changed) {
      return;
    }
    this.props.dispatch(
      downVote(
        {
          post_id: this.props.post_id
        },
        res => {
          if (res) {
            this.setState({
              changed: !this.state.changed,
              doChange: this.state.doChange - 1
            });
          }
        }
      )
    );
  }

  render() {
    let voted = this.props.liked ? true : false;
    if (this.state.changed) {
      voted = !voted;
    }

    let btn_class = 'btn btn-sm btn-vote pulsate-fwd action-upvote ';
    btn_class += voted ? ' upvoted ' : '';
    btn_class += 'btn_4_ques_' + this.props.post_id;
    btn_class += this.props.disabled ? ' disabled ' : '';

    return (
      <button
        type="button"
        className={btn_class}
        data-id={this.props.post_id}
        onClick={e => {
          if (this.props.disabled) {
            return;
          }
          this.changeVote(voted, e);
        }}
      >
        <i className="fa fa-thumb-up" />
        <span className="hidden-sm-down">
          {voted ? 'Liked' : 'Like'}
          <span>
            {' '}
            (
            {this.state.changed
              ? this.props.total_count
                ? this.props.total_count + this.state.doChange
                : '1'
              : this.props.total_count
                ? this.props.total_count
                : '0'}
            )
          </span>
        </span>
      </button>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token
  };
};

export default connect(mapStateToProps)(UpvoteButton);
