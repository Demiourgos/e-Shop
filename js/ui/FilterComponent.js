(function($, namespace) {
	function FilterComponent(config) {
		config = config || {};
		this.filterOptions = config.filterOptions || [];
		this.filterContianer = config.filterContianer;
		this.onFilterApplied = config.onFilterApplied || function() {};

		this.selectedFilterOptions = [];
		this._init();
	}

	FilterComponent.prototype = $.extend(FilterComponent.prototype, {
		_init: function () {			
			var _self = this;
			var $filterByBtn = $(document.createElement('button'))
								.text('Filter By')
								.on('click', function() {
									$filterOptionsUlDom.toggle();
								});
			var $filterOptionsUlDom = $(document.createElement('ul')).hide();			
			
			this.updateFilterDropdownList($filterOptionsUlDom);

			var $filterLozengeDom = $(document.createElement('div'))
					.addClass("lozenges-container")
					.on('click', '.lozenge', function() {
						var lozengeToRemove = $(this).closest('.lozenge'),
							selectedText = lozengeToRemove.find('label').text().toLowerCase();
						if(selectedText == 'clear all' || _self.selectedFilterOptions.length == 1){
							_self.selectedFilterOptions = [];
							lozengeToRemove.closest('.lozenges-container').empty();
						}else{
							lozengeToRemove.remove();
							var index = _self.selectedFilterOptions.indexOf(selectedText);
							if(index !== -1){
								_self.selectedFilterOptions.splice(index, 1);
							}
						}
						$filterByBtn.removeAttr('disabled');
						_self.updateFilterDropdownList($filterOptionsUlDom);
						_self.onFilterApplied(_self.selectedFilterOptions);
				});

			$filterOptionsUlDom.on('click', 'li', function() {
				var selectedFilterOption = $(this).text();
				$filterOptionsUlDom.toggle();
				_self.selectedFilterOptions.push(selectedFilterOption);
				_self.onFilterApplied(_self.selectedFilterOptions);
				_self.updateFilterLozenge($filterLozengeDom, selectedFilterOption);
				_self.updateFilterDropdownList($filterOptionsUlDom);
				if(_self.selectedFilterOptions.length === _self.filterOptions.length){
					$filterByBtn.attr('disabled', true);
				}else{
					$filterByBtn.removeAttr('disabled');
				}
			})			

			$(this.filterContianer).append($filterLozengeDom);
			$(this.filterContianer).append($filterByBtn);
			$(this.filterContianer).append($filterOptionsUlDom);
		},

		updateFilterDropdownList: function($filterOptionsUlDom) {
			$filterOptionsUlDom.empty();
			var _self = this;
			this.filterOptions.forEach(function(option) {
				if(_self.selectedFilterOptions.indexOf(option) === -1){
					$filterOptionsUlDom
					.append(
						$('<li/>')
							.text(option)
					);	
				}				
			})
		},
		updateFilterLozenge: function($lozengeContainer, selectedFilterOption) {
			$lozengeContainer
				.append(
					$('<div>')
					.addClass('lozenge')
					.append($('<i>').text('x'))
					.append($('<label>').text(selectedFilterOption))					
				);
			if(this.selectedFilterOptions.length > 1 && $lozengeContainer.find('.clear-all').length == 0){
				$lozengeContainer
				.prepend(
					$('<div>')
					.addClass('lozenge')
					.addClass('clear-all')
					.append($('<i>').text('x'))
					.append($('<label>').text('Clear All'))
				);
			}
		}
	});
	namespace('eShop.ui').FilterComponent = FilterComponent;
})($, namespace)