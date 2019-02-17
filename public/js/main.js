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