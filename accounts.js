//роутер для реализации многопользовательского интерфейса
var express 	= require('express'),
	bodyParser  = require('body-parser'),
	session 	= require('express-session'),
	Bourne 		= require('bourne'),		//mini-DB
	crypto 		= require('crypto');

var router  = express.Router(),
	db 		= new Bourne('users.json');

function hash (password) {
	return crypto.createHash('sha256').update(password).digest('hex');
}


router
	.use(bodyParser.urlencoded())
	.use(bodyParser.json())
	.use(session({ secret: 'adshlqr3kqwefsadjklqrwefdsbzcjxcq4rewfadshj' }))
	.get('/login', function (req, res) {
		res.sendfile('public/login.html');
	})
	.post('/login', function (req, res) {
		//собираем вводимые данные о пользователе в объект
		var user = {
			username: req.body.username,
			password: hash(req.body.password)
		};
		//запрашиваем данные из базы и либо пускаем, либо снова на авторизацию
		db.findOne(user, function (err, data) {
			if (data) {
				req.session.userId = data.id;
				res.redirect('/');
			} else {
				res.redirect('/login');
			}
		});
	})
	.post('/register', function (req, res) {
		var user = {
			username: req.body.username,
			password: hash(req.body.password),
			options: {}
		};
		//запрашиваем у БД нет ли у нас уже такого пользователя и если все ок - то добавляем запись
		//иначе снова на страницу авторизации
		db.find({ username: user.username }, function (err, data) {
			if (!data.length) {
				db.insert(user, function (err, data) {
					//объект сессси становится доступным нам благодаря middleware добавленому в начале
					req.session.userId = data.id;
					res.redirect('/');
				});
			} else {
				res.redirect('/login');
			}
		});
	})
	.get('/logout', function (req, res) {
		req.session.userId = null;
		res.redirect('/');
	})
	//добавляем данное middleware чтобы в остальных частях приложения мы могли получить доступ
	//к объекту req.user
	.use(function (req, res, next) {
		if (req.session.userId) {
			db.findOne({ id: req.session.userId }, function (err, data) {
				req.user = data;
			});
		}
		next();
	})
	//для зарегенных юзеров будем добавлять возможность задавать свои настройки 
	//(например какие поля они хотели бы видеть на главной странице всех контактов)
	.get('/options/displayed_fields', function (req, res) {
		if (!req.user) {
			res.json([]);
		} else {
			//возможно у нас у пользователя ничего еще не установлено в настройках - тогда вернем пустой массив
			res.json(req.user.options.displayed_fields || []);
		}
	})
	.post('/options/displayed_fields', function (req, res) {
		req.user.options.displayed_fields = req.body.fields;
		db.update({ id: req.user.id }, req.user, function (err, data) {
			res.json(data[0].options.displayed_fields);
		});
	});

module.exports = router;