(function ($, _ui, _data, _enum) {
	var fetchedProducts = [],
		productContainer = $('#product-container'),
		itemsPerRow = 3,
		visibleRows = 3,
		rowCount = 0,
		rowHeight = 0,
		virtualizer,
		fetchState = _enum.FetchState.FETCHING,
		loadMoreHeight = 40,
		pageNumber = 0, 
		pageSize = 90,
		sortOption = {sortedBy: null, isAsc: true},
		filterComponent;
	var dataFactory = new _data.DataFactory({pageSize: pageSize});

	$('.sort-anchor')
		.on('click', function() {
			var newSort;
			if(this.id == 'sortby_price'){
				newSort = _enum.SortedBy.PRICE;
			}else if(this.id == 'sortby_score'){
				newSort = _enum.SortedBy.SCORE;
			}
			if(newSort == sortOption.sortedBy){
				sortOption.isAsc = !sortOption.isAsc;
			}else{
				sortOption.sortedBy = newSort;
			}
			updateUI();
			performSorting();
		});

	function updateUI() {
		$('.sort-container')
			.attr('data-sort-by', sortOption.sortedBy === _enum.SortedBy.SCORE ? 'score' : 'price')
			.attr('data-sort-order', sortOption.isAsc ? 'Asc' : 'Desc');
	}

	function performSorting() {
		_ui.Loader.show();
		var sortByKey = (sortOption.sortedBy === _enum.SortedBy.SCORE ? 'score' : 'price');
		dataFactory
			.sort(sortByKey, sortOption.isAsc)
			.then(function(products) {
				virtualizer.clear({
					rowHeight: getRowHeight()
				});
				setFetchedProducts(products);
				_ui.Loader.hide();
			});
	}

	_ui.Loader.show();

	dataFactory
		.getData(pageNumber)
		.then(function(products) {
			setFetchedProducts(fetchedProducts.concat(products));
			_init();
		});

	function _init() {
		virtualizer = new _ui.VirtualLister({
			listContainer: productContainer,
			rowCount: rowCount,
			rowHeight: getRowHeight(),
			rowBuilder: constructRow,
			offsetHeight: areAllProductsFetched() ? 0 : loadMoreHeight,
			onScrollEnd: loadMore,
			showLoadMore: !areAllProductsFetched()
		});

		filterComponent = new _ui.FilterComponent({
			filterOptions: dataFactory.getDistinctValues('cat'),
			filterContianer: $('.filter-container'),
			onFilterApplied: onFilterApplied
		});

		_ui.Loader.hide();
	};

	function onFilterApplied(selectedCatFilters) {
		_ui.Loader.show();		
		var filters = selectedCatFilters.length > 0 ? [{key:'cat', values: selectedCatFilters}] : [];
		dataFactory
			.filter(filters)
			.then(function(products) {
				virtualizer.clear({
					rowHeight: getRowHeight()
				});
				setFetchedProducts(products);
				_ui.Loader.hide();
			});

	}

	function loadMore() {
		if(!areAllProductsFetched()){
			dataFactory
				.getData(++pageNumber)
				.then(processDataFetch);
		}
	}

	function processDataFetch(products) {
		if(products.length < pageSize){
			fetchState = _enum.FetchState.ALL_FETCHED;
		}else{
			fetchState = _enum.FetchState.PARTIAL_FETCH;
		}
		setFetchedProducts(fetchedProducts.concat(products));
	}

	function areAllProductsFetched() {
		return fetchState === _enum.FetchState.ALL_FETCHED;
	}

	function constructRow(node, rowIndex) {
		//find the items to be rendered
		var startIndex = rowIndex * itemsPerRow,
			endIndex = startIndex + itemsPerRow,
			products = fetchedProducts.slice(startIndex, endIndex);
		_ui.RowBuilder(node, products);
	}

	function setFetchedProducts(products) {
		fetchedProducts = products;
		rowCount = Math.ceil(products.length / itemsPerRow);
		if(areAllProductsFetched()){
			debugger;
		}
		if(virtualizer){
			virtualizer.UpdateFreshData({
				rowCount: rowCount,
				offsetHeight: areAllProductsFetched() ? 0 : loadMoreHeight,
				showLoadMore: !areAllProductsFetched()
			});
		}
	}

	function getRowHeight() {
		return Math.floor( productContainer.height() / visibleRows);
	}

	var timeSinceLastResize,
		minOffsetTime = 200,
		timeoutVar;
	$(window).resize(function() {		
		if(timeSinceLastResize && (new Date().valueOf() - timeSinceLastResize <= minOffsetTime)){
			clear(timeoutVar);
			timeoutVar = setTimeOut(triggerResize, minOffsetTime + 100);
		}else{
			triggerResize();
		}
		timeSinceLastResize = new Date().valueOf();
	});

	function triggerResize() {
		virtualizer.clear({
			rowHeight: getRowHeight()
		});
		setFetchedProducts(fetchedProducts);
	}

	$('.menu-toggle').on('click', function() {
		$('.sort-and-filter-bar').toggleClass('show');
	})

})($, eShop.ui, eShop.data, eShop.ENUM)