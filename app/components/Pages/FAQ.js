import React from 'react';
import {connect} from 'react-redux';
// import {Translate, withLocalize} from 'react-localize-redux';

class FAQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      faqs: []
    };
  }

  componentDidMount() {
    this.runQuery(this.props);
  }

  runQuery(prps) {
    fetch('/api/faq/list').then(res => {
      if (res) {
        res.json().then(obj => {
          this.setState({faqs: obj.faqs});
        });
      }
    });
  }

  render() {
    return (
      <div>
        <section className="page_title_bar">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="title_heading">F.A.Q.</h2>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="faq" id="accordion">
                  {this.state.faqs.map((faq, i) => {
                    return (
                      <div className="card" key={faq.id}>
                        <div className="card-header" id="faqHeading-1">
                          <div className="mb-0">
                            <h5
                              className="faq-title"
                              onClick={() => {
                                this.setState({open_faq: faq.id});
                              }}
                            >
                              <span className="badge">{i + 1}</span>
                              {this.props.activeLanguage &&
                              this.props.activeLanguage.code == 'fr'
                                ? faq.title_second_language
                                : faq.title}
                            </h5>
                          </div>
                        </div>

                        <div
                          className={
                            ' ' +
                            (this.state.open_faq == faq.id
                              ? ''
                              : ' hide hidden')
                          }
                        >
                          <div className="card-body">
                            <p>
                              {this.props.activeLanguage &&
                              this.props.activeLanguage.code == 'fr'
                                ? faq.content_second_language
                                : faq.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
    messages: state.messages
  };
};

export default connect(mapStateToProps)(FAQ);
