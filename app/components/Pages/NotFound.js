// has translations
import React from 'react';
// import {Translate} from 'react-localize-redux';

const NotFound = props => {
  return (
    <div>
      <div>
        <section className="page_title_bar noblend">
          <div className="container-fluid half">
            <div className="row">
              <div className="col-md-12 col-sm-12 col-xs-12">
                <div className="section-headline white-headline text-left">
                  <h3>404 Not Found</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

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
