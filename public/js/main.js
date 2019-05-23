function linkHashTags(txt){
  return txt.replace(/#(\S+)/g,'<a href="/feed/hashtag/$1" title="Find more posts tagged with #$1">#$1</a>');
}

// function linkHashTags(){
//   entries = doc.querySelectorAll('div.entry > p'),
//      i;
//
//   if ( entries.length > 0 ) {
//     for (i = 0; i < entries.length; i = i + 1) {
//       entries[i].innerHTML = entries[i].innerHTML.replace(/#(\S+)/g,'<a href="'+siteURL+'search/$1" title="Find more posts tagged with #$1">#$1</a>');
//     }
//   }
// }


(function ($) {
    "use strict";


  //mobile menu
  $(document).ready(function(){
    var ulNav= "#nav", openNav= "activeNav";

    $('.toggle-menu').on('click', function(e){
      if($(ulNav).hasClass(openNav)){
        $(ulNav).removeClass(openNav);
      }else{
        $(ulNav).addClass(openNav);
      }
      e.preventDefault();
    });
  });
})(jQuery);
