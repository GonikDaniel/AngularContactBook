/**
* ContactsApp Module
*
* Description
*/

angular.module('ContactsApp')
	.factory('Contact', function ($resource) {
        return $resource('/api/contact/:id', { id: '@id' }, {
            'update': { method: 'PUT' }
        });
	})
	//фабркиа для наших настроек
	//$q - Angular promises
	.factory('Fields', function ($q, $http, Contact){
		var url = '/options/displayed_fields',
			ignore = ['firstName', 'lastName', 'id', 'userId'],
			allFields = [],
			deferred = $q.defer(),

			//тут по сути много какой-то магии вуду, но в целом идет добавление полей контактов в массив
			//дабы потом использовать это в настройках и выводить нужные пользователю поля
			contacts = Contact.query(function () {
				contacts.forEach(function (c) {
					Object.keys(c).forEach(function (k) {
						//будем добавлять в наш массив только те поля, которых там еще нет И которые не входят в ignore массив
						if (allFields.indexOf(k) < 0 && ignore.indexOf(k) < 0) allFields.push(k);
					});
				});
				deferred.resolve(allFields);
			});
		return {
			//возращаем все это методами (get/post используемые внутри прописаны в accounts.js '/options/displayed_fields')
			//get будет выбирать то, что пользователь установливал раньше в кач-ве настроек 
			//а set будет обновлять его настройки
			get: function () {
				return $http.get(url);
			},
			set: function (newFields) {
				return $http.post(url, { field: newFields });
			},
			headers: function () {
				return deferred.promise;
			}
		};
	});