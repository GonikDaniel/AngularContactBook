angular.module('ContactsApp', ['ngRoute', 'ngResource', 'ngMessages'])
	.config(function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/contacts', {
				controller: 'ListController',
				templateUrl: 'views/list.html'
			})
			.when('/contact/new', {
				controller: 'NewController',
				templateUrl: 'views/new.html'
			})
			.when('/contact/:id', {
				controller: 'SingleController',
				templateUrl: 'views/single.html'
			})
			.when('/settings', {
				controller: 'SettingsController',
				templateUrl: 'views/settings.html'
			})
			.otherwise({
				redirectTo: '/contacts'
			});
		$locationProvider.html5Mode(true);	//дает нам поддержку html5 для старых браузеров, дабы не добавлять /#/ к каждому адресу вручную
	})
	//дабы иметь возможность использовать наши настройки вывода доп.полей в общем списке контактов
	//добавим объект options, в который будем изначально помещать то, что у нас уже было
	//а данные берем из нашей фабрики Fields запросом get
	.value('options', {})
	.run(function (options, Fields) {
		Fields.get().success(function (data) {
			options.displayed_fields = data;
		});
	});
