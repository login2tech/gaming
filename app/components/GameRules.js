import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import GameRules from './Modules/GameRules';

class GameRulesPage extends React.Component {
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
                  <div className="banner_actions">
                    <Link
                      to={
                        '/game/' +
                        this.props.params.id +
                        '/' +
                        this.props.params.title
                      }
                      className="pt-3 pb-3 dib"
                    >
                      <span className="fa fa-arrow-left" /> back to game
                      homepage
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <GameRules title={this.props.params.title} />
                <br />
                <br />
                <br />
                <br />
                <br />
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

export default connect(mapStateToProps)(GameRulesPage);
