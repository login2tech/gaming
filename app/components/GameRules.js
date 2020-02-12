import React from 'react';
import {connect} from 'react-redux';
class GameRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: {}
    };
  }

  componentDidMount() {
    this.fetchGame();
    //
  }

  fetchGame() {
    fetch('/api/games/single/' + this.props.params.id)
      .then(res => res.json())
      .then(json => {
        if (!json.ok) {
          return;
        }
        this.setState({
          game: json.item
        });
      });
  }
  render() {
    return (
      <div>
        <section className="page_title_bar noblend has_action_bar">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h2>Game Rules </h2>
                  <h3>{this.state.game.title}</h3>
                  <br />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div
                  dangerouslySetInnerHTML={{__html: this.state.game.rules}}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    user: state.auth.user,
    settings: state.settings,
    messages: state.messages
  };
};

export default connect(mapStateToProps)(GameRules);
