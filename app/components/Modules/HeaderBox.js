import React from 'react';

const HeaderBox = props => {
  console.log(props);
  return (
    <section className="page_title_bar noblend">
      <div className="container-fluid half">
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="section-headline white-headline text-left">
              <h3 className="no-case-change  lil-small">{props.title}</h3>
              <br />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeaderBox;
