/**
* ContactsApp Module
*
* наши самописные фильтры
*/

angular.module('ContactsApp')
	//преобразование camelCase в нормальные словосочетания (Camel Case)
	.filter('labelCase', function(){
		return function (input) {
			input = input.replace(/([A-Z])/g, ' $1');
			return input[0].toUpperCase() + input.slice(1);
		};
	})
	//фильтр для новых полей формы нового контакта (будем переводить названия полей в camelCase)
	.filter('camelCase', function () {
		return function (input) {
			// First Name -> firstName
			return input.toLowerCase().replace(/ (\w)/g, function (match, letter) {
				return letter.toUpperCase();
			});
		};
	})
	//свой фильтр для того, чтобы при выводе полей форм через ng-repeat наши
	//обязательные поля (firstName & lastName) не дублировались при выводе всех полей в цикле
	//obj в нашем случае это contact (из шаблона new.html), а query - это передаваемый после фильтра параметры
	.filter('keyFilter', function() {
		return function (obj, query) {
			var result = {};
			angular.forEach(obj,function (val, key) {
				if (key !== query) {
					result[key] = val;
				}
			});

			return result;
		};
	});
