import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Translate} from 'react-localize-redux';

class Home extends React.Component {
  language = {};
  render() {
    // console.log(this.props);

    return (
      <div>
        <section id="slider-area" className="slider-area">
          <div className="overlay" />
          <div className="container">
            <div className="row sbanner">
              <div className="col-lg-7">
                <div className="slide-item">
                  <div className="slide-caption">
                    <div className="slider-inner">
                      <div className="innerSize">
                        <h1 className="caption-title">
                          <Translate id="main_heading" />
                        </h1>

                        <p className="caption-desc">
                          <Translate id="main_content_para_1" />
                        </p>
                        <p className="caption-desc">
                          <Translate id="main_content_para_2" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="slider_wrap">
                  <div className="slider">
                    <div className="slide1">
                      <img className="img-fluid show" src="/imgs/box_pic.png" />
                    </div>
                    <div className="slide2">
                      <img className="img-fluid" src="/imgs/box_pic_2.png" />
                    </div>
                    <div className="slide3">
                      <img className="img-fluid" src="/imgs/box_pic_3.png" />
                    </div>
                  </div>
                  <div className="slide-btn">
                    <Link className="mybtn" to="/order">
                      <i className="fa fa-upload" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="about">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div className="sectionHeader">
                  <div className="icon_co">
                    <i className="far fa-comments" />
                  </div>
                  <h2>
                    <Translate id="testimonial_heading" />
                  </h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div id="testimonial-slider" className="owl-carousel">
                  <div className="testimonial">
                    <div className="testimonial-content">
                      <div className="testimonial-icon">
                        <i className="fa fa-quote-left" />
                      </div>
                      <p className="description">
                        <Translate id="testimonial_1" />
                      </p>
                    </div>
                    <h3 className="title">
                      <Translate id="testimonial_1_name" />
                    </h3>
                  </div>

                  <div className="testimonial">
                    <div className="testimonial-content">
                      <div className="testimonial-icon">
                        <i className="fa fa-quote-left" />
                      </div>
                      <p className="description">
                        <Translate id="testimonial_2" />
                      </p>
                    </div>
                    <h3 className="title">
                      <Translate id="testimonial_2_name" />
                    </h3>
                  </div>

                  <div className="testimonial">
                    <div className="testimonial-content">
                      <div className="testimonial-icon">
                        <i className="fa fa-quote-left" />
                      </div>
                      <p className="description">
                        <Translate id="testimonial_3" />
                      </p>
                    </div>
                    <h3 className="title">
                      <Translate id="testimonial_3_name" />
                    </h3>
                  </div>

                  <div className="testimonial">
                    <div className="testimonial-content">
                      <div className="testimonial-icon">
                        <i className="fa fa-quote-left" />
                      </div>
                      <p className="description">
                        <Translate id="testimonial_4" />
                      </p>
                    </div>
                    <h3 className="title">
                      <Translate id="testimonial_4_name" />
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="serviceSection" className="serviceSection">
          <div className="container">
            <div className="row justify-content-center" />
            <div className="row">
              <div className="col-md-6 col-lg-6">
                <div className="box">
                  <div className="icon">
                    <i className="fas fa-gift" />
                  </div>
                  <h4>
                    <Translate id="home_free_heading" />
                  </h4>
                  <p>
                    <Translate id="home_free_content" />
                  </p>
                </div>
              </div>

              <div className="col-md-6 col-lg-6">
                <div className="box">
                  <div className="icon">
                    <i className="fas fa-chess-queen" />
                  </div>
                  <h4>
                    <Translate id="home_premium_heading" />
                  </h4>
                  <p>
                    <Translate id="home_premium_content" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="videoSection" className="videoSection">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div className="sectionHeader">
                  <h2>
                    <Translate id="how_it_works_heading" />
                  </h2>
                </div>
              </div>
            </div>
            <div className="row serviceSection min-height">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-md-6 col-lg-6">
                    <div className="box">
                      <div className="icon">
                        <i className="fas fa-upload" />
                      </div>
                      <h4>
                        <Translate id="hit_1_heading" />
                      </h4>
                      <p>
                        <Translate id="hit_1_content" />
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-6">
                    <div className="box">
                      <div className="icon">
                        <i className="fas fa-tachometer-alt" />
                      </div>
                      <h4>
                        <Translate id="hit_2_heading" />
                      </h4>
                      <p>
                        <Translate id="hit_2_content" />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 col-lg-6">
                    <div className="box">
                      <div className="icon">
                        <i className="fas fa-ok" />
                      </div>
                      <h4>
                        <Translate id="hit_3_heading" />
                      </h4>
                      <p>
                        <Translate id="hit_3_content" />
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-6">
                    <div className="box">
                      <div className="icon">
                        <i className="fas fa-chart-pie" />
                      </div>
                      <h4>
                        <Translate id="hit_4_heading" />
                      </h4>
                      <p>
                        <Translate id="hit_4_content" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing_box">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div className="sectionHeader">
                  <h2>
                    <Translate id="pricing_plan_heading" />
                  </h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <table
                  className="table table-striped"
                  width="100%"
                  align="left"
                >
                  <thead>
                    <tr>
                      <th align="left">&nbsp;</th>
                      <th align="center">
                        <span className="head">
                          <Translate id="home_free_heading" />
                        </span>
                      </th>
                      <th align="center">
                        <span className="head">
                          <Translate id="home_premium_heading" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td align="left">
                        <Translate id="pricing_table_1" />
                      </td>
                      <td align="center">
                        <Translate id="pricing_table_1_free" />
                      </td>
                      <td align="center">
                        <Translate id="pricing_table_1_paid" />
                      </td>
                    </tr>
                    <tr>
                      <td align="left">
                        <Translate id="pricing_table_2" />
                      </td>
                      <td align="center">
                        <i className="fa fa-cancel" aria-hidden="true" />
                      </td>
                      <td align="center">
                        <i className="fa fa-ok" aria-hidden="true" />
                      </td>
                    </tr>
                    <tr>
                      <td align="left">
                        <Translate id="pricing_table_3" />
                      </td>
                      <td align="center">
                        <i className="fa fa-cancel" aria-hidden="true" />
                      </td>
                      <td align="center">
                        <i className="fa fa-ok" aria-hidden="true" />
                      </td>
                    </tr>
                    <tr>
                      <td align="left">
                        <Translate id="pricing_table_4" />
                      </td>
                      <td align="center">
                        <i className="fa fa-cancel" aria-hidden="true" />
                      </td>
                      <td align="center">
                        <i className="fa fa-ok" aria-hidden="true" />
                      </td>
                    </tr>
                    <tr>
                      <td align="left">
                        <Translate id="pricing_table_5" />
                      </td>
                      <td align="center">
                        <i className="fa fa-ok" aria-hidden="true" />
                      </td>
                      <td align="center">
                        <i className="fa fa-cancel" aria-hidden="true" />
                      </td>
                    </tr>
                    <tr>
                      <td align="left">&nbsp;</td>
                      <td align="center">
                        <Link className="plan_bttn" to="/order">
                          <Translate id="pricing_table_free_btn" />
                        </Link>
                      </td>
                      <td align="center">
                        <Link className="plan_bttn" to="/order">
                          <Translate id="pricing_table_paid_btn" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
    messages: state.messages,
    language: state.language
  };
};

export default connect(mapStateToProps)(Home);
