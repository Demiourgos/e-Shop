(function($, namespace) {
	var Loader = {
		show: function() {
			$('.page-loader').addClass('show');
		},
		hide: function() {
			$('.page-loader').removeClass('show');
		}
	}
		
	namespace('eShop.ui').Loader = Loader;
	
})($, namespace)