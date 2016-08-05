(function(){
angular.module('starter').controller('OverviewController', ['$scope', '$ionicModal', '$ionicPlatform', 'itemsStorage', '$rootScope', '$ionicPopup', OverviewController]);

function OverviewController($scope, $ionicModal, $ionicPlatform, itemsStorage, $rootScope, $ionicPopup) {
	var vm = this;

	// Initialize the database.
	$ionicPlatform.ready(function() {
		itemsStorage.initDB();
		vm.items = [];
		vm.duration = 0;
		vm.quantity = 1;
		vm.startTime  = 0;
		vm.loading = false;
		vm.ls = '';
	});

	var timeStart = function () {
		vm.startTime  = new Date();
		vm.loading = true;
	}

	var timeCalculate = function () {
		vm.duration = new Date() - vm.startTime;
		vm.loading = false;
	}

	// Initialize the modal view.
	$ionicModal.fromTemplateUrl('add-or-edit-item.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	vm.getItems = function (type) {
		timeStart();
		itemsStorage.getItems(type).then(function(items) {
			timeCalculate();
			vm.items = items;
			vm.quantity = items.length;
		});
	}

	vm.showEditItem = function(item) {
		$scope.item = item;
		$scope.action = 'Edit';
		$scope.isAdd = false;
		$scope.modal.show();
	};

	vm.getLocalStorage = function () {
		return itemsStorage.getLocalStorage();
	};

	// Triggered on a button click, or some other target
	vm.showVersion = function() {
	  $scope.ls = vm.getLocalStorage();

	  // An elaborate, custom popup
	  var myPopup = $ionicPopup.show({
	    template: '<div class="text-center">{{ls}}</div><div ng-if="!ls"class="text-center" style="color:gray">(empty)</div>',
	    title: 'localStorage',
	    subTitle: 'Showing data from localStorage',
	    scope: $scope,
	    buttons: [
	      {
	        text: '<b>Ok</b>',
	        type: 'button-positive'
	      }
	    ]
	  });
}

	$scope.clearDB = function() {
		vm.quantity = 'all :-)';
		timeStart();
		itemsStorage.emptyDB().then(function () {
			itemsStorage.initializeDBStructure().then(function () {
				timeCalculate();
			})
		});
	}

	$scope.initializeDBStructure = function() {
		timeStart();
		itemsStorage.initializeDBStructure().then(function () {
			timeCalculate();
		});
	}

	$scope.addRandomItems = function (type, n) {
		timeStart();
		vm.quantity = n;
		itemsStorage.addRandomItems(type, n).then(function () {
			timeCalculate();
		});
	};

	$scope.updateItem = function() {
		timeStart();
		vm.quantity = 1;
		itemsStorage.updateItem($scope.item).then(function() {
				timeCalculate();
		});
		$scope.modal.hide();
	};

	$scope.deleteItem = function() {
		timeStart();
		vm.quantity = 1;
		itemsStorage.deleteItem($scope.item).then(function () {
			timeCalculate();
		});
		$scope.modal.hide();
	};

	$scope.writeToLocalStorage = function (s) {
		itemsStorage.writeToLocalStorage(s);
	};

	$scope.emptyLocalStorage = function () {
		itemsStorage.emptyLocalStorage();
	}

	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	return vm;
}
})();
