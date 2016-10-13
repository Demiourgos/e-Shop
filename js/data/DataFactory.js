(function($, namespace) {
	function DataFactory(config) {
		config = config || {};
		this.serviceUrl = config.serviceUrl || 'https://test-prod-api.herokuapp.com/products';
		this.pageSize = config.pageSize || 45;
		this.fetchedData; // this stores the entire data set
		this.dummyTimeout = 1000; // in milliseconds
		this.filteredData;
	}

	DataFactory.prototype = $.extend(DataFactory.prototype, {
		//page number starts from 0
		getData: function(pageNumber) {
			var _self = this;
			pageNumber = pageNumber || 0;
			//get the data for the given page number
			if(_self.fetchedData){
				return _self._promiseWrapper(_self._getPageData(pageNumber));
			}else{
				return new Promise(function(resolve, reject) {
					$.getJSON(
						_self.serviceUrl, 
						function(data){
							_self.fetchedData = data.products.map(function(product) {
								product.scorePercentage = Math.round(product.score * 1000) / 10;
								return product;
							});
							_self.filteredData = _self.fetchedData;
							console.log(_self.filteredData);
							resolve(_self._getPageData(pageNumber));
						}
					 );
				})
			}
		},

		_getPageData: function(pageNumber) {
			var startIndex = pageNumber * this.pageSize,
				endIndex   = startIndex + this.pageSize;
			return this.filteredData.slice(startIndex, endIndex);
		},

		_promiseWrapper: function(data) {
			var _self = this;
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(data);
				}, _self.dummyTimeout);
			});
		},		

		filter: function (keyValuesPairs) {
			if(keyValuesPairs.length > 0){
				this.filteredData = this.fetchedData.reduce(function(result, product) {
					var key;
					for (var i = keyValuesPairs.length - 1; i >= 0; i--) {
						key = keyValuesPairs[i].key;
						if(keyValuesPairs[i].values.indexOf(product[key]) !== -1){
							result.push(product);
							break;
						}
					}
					return result;
				}, []);
			}else{
				this.filteredData = this.fetchedData;
			}
			return this.getData();
		},

		sort: function(sortByKey, isAsc) {
			var sortFn = function(a, b) {
				return isAsc ? a[sortByKey] - b[sortByKey] : b[sortByKey] - a[sortByKey];
			}
			this.fetchedData = this.fetchedData.sort(sortFn);
			this.filteredData = this.filteredData.sort(sortFn);
			return this.getData(0);
		},

		_parseDistinctPairs: function (key) {
			return this.filteredData
				.reduce(function (pairs, product) {
					if(!pairs[key]){pairs[key] = [];}
					if(pairs[key].indexOf(product[key]) === -1){
						pairs[key].push(product[key]);
					}
					return pairs;
				}, {})[key];

		},

		getDistinctValues: function(key) {
			return this._parseDistinctPairs(key);
		}
	});

	namespace('eShop.data').DataFactory = DataFactory;
})($, namespace)