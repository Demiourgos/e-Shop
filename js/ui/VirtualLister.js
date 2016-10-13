(function($, namespace) {
	function VirtualLister(config) {
		//this will append and remove the elements to create virtual listing
		//it needs the total row count, height of each row
		config = config || {};
		if(!config.listContainer) throw "listContainer is mandatory. pass the node";
		this.listContainer = config.listContainer;
		this.rowCount = config.rowCount;
		this.rowHeight = config.rowHeight;
		this.offsetHeight = config.offsetHeight || 0;
		this.rowBuilder = config.rowBuilder; //this method needs to return the row content to be rendered
		this.showLoadMore = config.showLoadMore || false;
		this.loadMoreText = config.loadMoreText || 'Loading...';
		this.onScrollEnd = config.onScrollEnd || function () {};

		//internal variables
		this.listWrapper;
		this.loadMoreNode;
		this.visibleRows = [];

		this.virtualDomCache = {};
		this._init();
	}

	VirtualLister.prototype = $.extend(VirtualLister.prototype, {
		_init: function () {
			$(this.listContainer).addClass('virtual-list-outer-container');
			this.listWrapper = this._createWrapper();
			this._renderRows();
			this._bindEvents();
		},

		_bindEvents: function() {
			$(this.listContainer).on("scroll", this._onScroll.bind(this));
		},

		_onScroll: function() {
			this._renderRows();
			//check if the scroll has reached the end and load more is shown
			var scrollHeight = $(this.listContainer).scrollTop(),
				containerHeight = $(this.listContainer).height();
			if(this.showLoadMore && ((scrollHeight + containerHeight) > $(this.listWrapper).height() - (this.offsetHeight / 2))){
				this.onScrollEnd();
			}
		},

		_createWrapper: function() {
			var wrapper = document.createElement('div');
			wrapper.style.height = ((this.rowCount * this.rowHeight) + this.offsetHeight) + 'px';
			$(wrapper).addClass('virtual-list-inner-container');
			$(this.listContainer).append(wrapper);
			if(this.showLoadMore){
				this.loadMoreNode = document.createElement('div');
				$(this.loadMoreNode)
					.addClass('load-more')
					.text(this.loadMoreText);
				$(wrapper).append(this.loadMoreNode);
			}
			return wrapper;
		},
		_renderRows: function() {
			var _self = this,
				scrollHeight = $(this.listContainer).scrollTop(),
				scrollerHeight = $(this.listContainer).height(),
				startRow = Math.floor(scrollHeight / this.rowHeight),
				endRow = Math.min(Math.ceil(scrollerHeight / this.rowHeight) + startRow, this.rowCount - 1);

			//remove rows that are not required
			//append rows that are to be shown
			_self._removeRows(startRow, endRow);
			for (var i = startRow; i <= endRow; i++) {
				(function (rowIndex) {
					if(_self.visibleRows.indexOf(rowIndex) === -1){
						//render the row
						var row = _self._createRow(rowIndex);
						_self.visibleRows.push(rowIndex);
					}
				})(i);
			}
		},

		_createRow: function(rowIndex) {
			if(this.virtualDomCache[rowIndex]){
				$(this.listWrapper).append(this.virtualDomCache[rowIndex]);
				return this.virtualDomCache[rowIndex];
			}

			var rowWrapper = document.createElement('div');
			var translatePosition = rowIndex * this.rowHeight;
			$(rowWrapper)
				.addClass('virtual-list-row')
				.attr('row-index', rowIndex)
				.css('transform', 'translateY('+ translatePosition +'px)')
				.css('height', this.rowHeight + 'px');
			$(this.listWrapper).append(rowWrapper);
			this.rowBuilder(rowWrapper, rowIndex)

			this.virtualDomCache[rowIndex] = rowWrapper;
			return rowWrapper;
		},

		_removeRows: function(startRow, endRow) {
			this.visibleRows = this.visibleRows.reduce(function(visibleRows, rowNum) {
				if(rowNum < startRow || rowNum > endRow){
					$('div[row-index='+ rowNum +']')
						.each(function(index, node) {
							node.parentElement.removeChild(node);
						});
				}else{
					visibleRows.push(rowNum);
				}
				return visibleRows;
			}, []);
		},
		UpdateFreshData: function(config) {
			config = config || {};
			this.rowCount = config.rowCount || this.rowCount;
			this.rowHeight = config.rowHeight || this.rowHeight;
			this.offsetHeight = typeof config.offsetHeight == "undefined" ? this.offsetHeight : config.offsetHeight;
			this.showLoadMore = typeof config.showLoadMore == "undefined" ? this.showLoadMore : config.showLoadMore;
			this._resetHeight();
		},
		clear: function (config) {
			config = config || {};
			this.rowHeight = config.rowHeight || this.rowHeight;
			this.virtualDomCache = {};
			$('div[row-index]').remove();
			this.visibleRows = [];
			$(this.listContainer).scrollTop(0);
		},

		_resetHeight: function () {
			this.listWrapper.style.height = ((this.rowCount * this.rowHeight) + this.offsetHeight) + 'px';
			if(!this.showLoadMore){
				$(this.loadMoreNode).remove();
			}else{
				$(this.listWrapper).append(this.loadMoreNode);
			}
			this._renderRows();
		}
	});

	namespace('eShop.ui').VirtualLister = VirtualLister;
})($, namespace)