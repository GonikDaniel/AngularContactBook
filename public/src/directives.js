/**
* Here all types of error that we have and msgs which we'll display in case of user's mistakes
*/
angular.module('ContactsApp')
	.value('FieldTypes', {
		text: ['Text', 'should be text'],
		email: ['Email', 'should be an email adress'],
		number: ['Number', 'should be a number'],
		date: ['Date', 'should be a datetime'],
		datetime: ['Datetime', 'should be a time'],
		time: ['Time', 'should be a month'],
		month: ['Month', 'should be a date'],
		week: ['Week', 'should be a week'],
		url: ['URL', 'should be a URL'],
		tel: ['Phone number', 'should be a phone number'],
		color: ['Color', 'should be a color']
	})
	//берем наши value для error-msgs и создаем наш собственный тег form-field, который
	//будем заменять в нашем шаблоне new.html
	//restrict EA задает то, что директива будет тегом (а не аттрибутом)
	//replace говорит что мы хотим заменить тег нашим содержимым (а не вставить его внутрь тега)
	.directive('formField', function ($timeout, FieldTypes) {
		return {
			restrict: 'EA',
			templateUrl: 'views/form-field.html',
			replace: true,
			//здесь происходит связывание аттрибутов нашего тега (директивы) и данных контроллера
			//record будем иметь двустороннее связывание, так что мы будем обновлять данные из массива $scope.contact
			//а всем остальным аттрибутам двусторонее связывание не нужно, поэтому ставим @
			scope: {
				record: '=',
				field: '@',
				live: '@',
				required: '@'
			},
			//связывание директивы с данными сообщений об ошибках
			//и действия по событиям прописанным в шаблоне form-field.html
			link: function ($scope, element, attr) {
				//здесь мы ставим event listener на событие record:invalid, 
				//которое может прийти от нашего контроллера при попытки сохранения формы
				//с неверными данными
				//и по этому событию мы будем подсвечивать ошибки для пользователя
				$scope.$on('record:invalid', function () {
				    $scope[$scope.field].$setDirty();
				});

				$scope.types = FieldTypes;

				$scope.remove = function (field) {
					delete $scope.record[field];
					$scope.blurUpdate();
				};
				//сохраняем наши изменения по наступлению события blur
				$scope.blurUpdate = function () {
					if ($scope.live !== 'false') {
						$scope.record.$update(function (updateRecord) {
							$scope.record = updatedRecord;
						});
					}
				};
				//также будем сохранять наши изменения по прошествию заданного промежутка времени
				//т.е. мы сначала отменяем постоянное сохранение, а затем
				//задаем таймаут в 1 секунду, через который мы будем вызывать нашу функцию
				//blurUpdate, которая в свою очередь будет сохранять наши данные
				var saveTimeout;
				$scope.update = function () {
					$timeout.cancel(saveTimeout);
					saveTimeout = $timeout($scope.blurUpdate, 1000);
				};
			}
		};
	})
	//директива для новых полей формы контакта
	.directive('newField', function ($filter, FieldTypes) {
		return {
			restrict: 'EA',
			templateUrl: 'views/new-field.html',
			replace: true,
			scope: {
				record: '=',
				live: '@'
			},
			require: '^form',	//каким-то волшебным образом обращается к нашей главной форме нового контакта
			//а теперь связываем данные нашего шаблона со свойствами и методами директивы
			link: function ($scope, element, attr, form) {
				$scope.types = FieldTypes;
				$scope.field = {};
				//будем показывать поля для данных нового поля, когда юзер выберет какой тип поля он хочет добавить
				$scope.show = function (type) {
					$scope.field.type = type;
					$scope.display = true;
				};
				//если пользователь все же решает удалить вновь добавленное поле просто обнуляем наш объект и убираем поля
				//для нового поля из видимости
				$scope.remove = function () {
					$scope.field = {};
					$scope.display = false;
				};
				//добавляем таки новое поле
				$scope.add = function () {
					//form - это наша родительская главная форма нового контакта из new.html, 
					//а к newField мы ее привязали как я понял с помощью required
					if (form.newField.$valid) {
						//field.name & field.value мы берем из inputs шаблона new-field
						$scope.record[$filter('camelCase')($scope.field.name)] = [$scope.field.value, $scope.field.type];
						$scope.remove(); //вызываем вышеописанный метод дабы мы могли добавлять новые поля
						if ($scope.live !== 'false') {
							$scope.record.$update(function (updateRecord) {
								$scope.record = updatedRecord;
							});
						}
					}
				};
			}
		};
	});