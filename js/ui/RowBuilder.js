(function($, namespace) {
	var imageNotFoundUrl = './images/image-not-found.jpg';
	function _createElement(tag) {
		return function() {
			return $(document.createElement(tag));
		}		
	}

	var _createDiv = _createElement('div');
	var _createImg = _createElement('img');
	var _createLabel = _createElement('label');

	function _createProductNode(product) {
		var ctr = _createDiv()
			.addClass("product-container")
			.attr('data-productId', product.id);
		
		var imgCtr = _createDiv()
				.addClass("image-container");

		var imgLoader = _createDiv().addClass('img-loader');
		imgCtr
			.append(imgLoader)
			.append(
				_createImg()
					.addClass('product-imgage')
					.attr('src', product.img)
					.css('display', 'none')
					.on('load', function() {
						console.log('loader hidden', product.id);
						imgLoader.hide();
						$(this).show();
					})
					.on('error', function() {
						this.src = imageNotFoundUrl;
					})
			);
		ctr.append(imgCtr);

		var getScoreColor = function(scorePercentage) {
			if(scorePercentage >= 60){
				return "green";
			}else if(scorePercentage >= 30){
				return "yellow";
			}else{
				return "red";
			}
		}
		
		var productInfoCtr = _createDiv().addClass('product-info-container');
		productInfoCtr
			.append(
				_createLabel()
					.addClass("product-name")
					.text(product.name)
			)
			.append(
				_createLabel()
					.addClass("product-price")
					.text(product.price)
			)
			.append(
				_createLabel()
					.addClass("product-cat")
					.text(product.cat)
			)
			.append(
				_createLabel()
					.addClass("product-score")
					.addClass(getScoreColor(product.scorePercentage))
					.text(product.scorePercentage)
			);


			
		ctr.append(productInfoCtr);

		return ctr;
	}

	function RowBuilder(container, products) {
		products.forEach(function(product) {
			$(container).append(_createProductNode(product));
		})
	}
	
	namespace('eShop.ui').RowBuilder = RowBuilder;
})($, namespace)