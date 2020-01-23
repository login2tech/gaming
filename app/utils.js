import React from 'react';
const utils = {
  platform_icon: function(name) {
    if (!name) {
      return;
    }
    name = name.toLowerCase();
    if (name.indexOf('xbox') > -1 || name.indexOf('x box') > -1) {
      return <span className="fab fa-xbox" />;
    }
    if (name.indexOf('playstation') > -1) {
      return <span className="fab fa-playstation" />;
    } else if (name.indexOf('pc') > -1) {
      return <span className="fa fa-desktop" />;
    } else if (name.indexOf('crossplatform') > -1) {
      return <span className="fa fa-cubes" />;
    }
    return false;
  }
};
export default utils;
