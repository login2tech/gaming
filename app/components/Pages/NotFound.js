// has translations
import React from 'react';
// import {Translate} from 'react-localize-redux';
import HeaderBox from '../Modules/HeaderBox';
const NotFound = props => {
  return (
    <div>
      <div>
        <HeaderBox title={'404 Not Found'} cls="all_t_heading" />

        <section className="contet_part">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                The page you are looking for doesnt exist
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotFound;
