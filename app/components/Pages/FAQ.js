import React from 'react';
import {connect} from 'react-redux';
// import {Translate, withLocalize} from 'react-localize-redux';

import HeaderBox from '../Modules/HeaderBox';

class FAQ extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      faqs: {},
      faq_c: []
    };
  }

  componentDidMount() {
    this.runQuery(this.props);
  }

  runQuery(prps) {
    fetch('/api/faq/list').then(res => {
      if (res) {
        res.json().then(obj => {
          const faqs = {};
          for (let i = 0; i < obj.faqs.length; i++) {
            const faq = obj.faqs[i];
            if (!faqs[faq.category]) {
              faqs[faq.category] = [];
            }
            faqs[faq.category].push(faq);
          }
          this.setState({faqs: faqs, faq_c: Object.keys(faqs)});
        });
      }
    });
  }

  render() {
    return (
      <div>

        <HeaderBox title={'404 Not Found'} cls='all_t_heading' />

        <section className="faq-section mb-5">
          <div className="container mb-5">
            <div className="row mb-5">
              <div className="col-md-12 mb-5">
                {this.state.faq_c.map((faqc, j) => {
                  return (
                    <>
                      <h2>{faqc}</h2>
                      <div className="faq  mb-5" id={'accordion_' + j}>
                        {this.state.faqs[faqc].map((faq, i) => {
                          return (
                            <div
                              className={
                                'card ' +
                                (this.state.open_faq == faq.id
                                  ? ' is_opened '
                                  : ' ')
                              }
                              key={faq.id}
                            >
                              <div className="card-header" id="faqHeading-1">
                                <div className="mb-0">
                                  <h5
                                    className="faq-title text-white"
                                    onClick={() => {
                                      if (this.state.open_faq == faq.id) {
                                        this.setState({
                                          open_faq: ''
                                        });
                                      } else {
                                        this.setState({open_faq: faq.id});
                                      }
                                    }}
                                  >
                                    <span className="badge badge-primary">
                                      {i + 1}
                                    </span>{' '}
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
                                  <div
                                    className="trix-content  text-white"
                                    dangerouslySetInnerHTML={{
                                      __html: faq.content.replace(
                                        'www.onlycompgaming.com',
                                        'ocg-5ms.herokuapp.com'
                                      )
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })}
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
