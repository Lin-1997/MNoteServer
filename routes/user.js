var express = require ('express');
var router = express.Router ();
var connection = require ('../DB');
var multipart = require ('multiparty');
var fs = require ("fs");
var async = require ('async');
var path = require ("path");

router.post ('/findAccount', function (req, res)
{
	var params = [req.body.account];
	connection.query ('call findAccount(?);', params, function (err, rows)
	{
		var num = JSON.parse (JSON.stringify (rows[0]))[0].num;
		if (err)
		{
			console.log ('findAccount err:' + err);
			res.end (':-1');
		}
		else if (num !== 0)
		{
			console.log ('findAccount not empty:' + params);
			res.end (':1');
		}
		else
		{
			console.log ('findAccount empty:' + params);
			res.end (':0');
		}
	});
});

router.post ('/signUp', function (req, res)
{
	var account = req.body.account;
	var params = [account, req.body.password];
	connection.query ('call signUp(?,?);', params, function (err)
	{
		if (err)
		{
			console.log ('signUp err:' + err);
			res.end (':-1');
		}
		else
		{
			console.log ('signUp ok:' + params);
			var avatarPath = path.join (__dirname, '../user/' + account);
			fs.mkdirSync (avatarPath);
			res.end (':1');
		}
	});
});

router.post ('/signIn', function (req, res)
{
	var account = req.body.account;
	var params = [account, req.body.password];

	var json = {};
	var avatarPath = path.join (__dirname, '../user/' + account + '/avatar.jpg');
	var avatar = '';
	async.series ({
			one: function (callback)
			{
				connection.query ('call signIn(?,?);', params, function (err, rows)
				{
					if (err)
					{
						console.log ('signIn err:' + err);
						res.end (':-1');
						//错误优先的回调函数
						//第一个参数是错误
						//只要不为空就不会执行后面的task
						//会调用结果处理的函数
						callback (err, 1);
					}
					else if (JSON.parse (JSON.stringify (rows[0])).length === 0)
					{
						console.log ('signIn empty:' + params);
						res.end (':0');
						callback ("no such user", 1);
					}
					else
					{
						console.log ('signIn ok:' + params);
						json['name'] = JSON.parse (JSON.stringify (rows[0]))[0].name;
						callback (null, 1);
					}
				});
			},
			two: function (callback)
			{
				fs.readFile (avatarPath, function (err, data)
				{
					if (err)
					{
						console.log ('getAvatar err:' + err);
						res.send (json);
						callback ("no avatar", 2);
					}
					else
					{
						console.log ('getAvatar ok:' + params);
						avatar = data.toString ('base64');
						json['avatar'] = avatar;
						res.send (json);
						callback (null, 2);
					}
				});
			}
		},
		function (err)
		{
			if (err !== null)
			{
				console.log ('async.series err:' + err);
			}
		});
});

router.post ('/getAvatar', function (req, res)
{
	var account = req.body.account;
	var avatarPath = path.join (__dirname, '../user/' + account + '/avatar.jpg');
	fs.readFile (avatarPath, function (err, data)
	{
		if (err)
		{
			console.log ('getAvatar err:' + err);
			res.end (':-1');
		}
		else
		{
			console.log ('getAvatar ok:' + account);
			res.end (data.toString ('base64'));
		}
	});
});

router.post ('/changeAvatar', function (req, res)
{
	//生成multiparty对象，并配置接收目标路径
	//var form = new multiparty.Form({uploadDir: './public/files/'});
	//生成multiparty对象
	var form = new multipart.Form ();
	//接收完成后处理
	form.parse (req, function (err, fields, files)
	{
		if (err)
		{
			console.log ('changeAvatar err:' + err);
			res.end (':-1');
		}
		else
		{
			var account = fields.account[0];
			var inputFile = files.avatar[0];
			//接收文件的时候的目录和名字
			var oldPath = inputFile.path;
			//这是要修改的目录和名字
			//originalFilename是上传之前在客户机的名字，是avatar.jpg
			var newPath = path.join (__dirname, '../user/' + account + '/' + inputFile.originalFilename);
			//重命名，也可以同时作移动文件
			fs.rename (oldPath, newPath, function (err)
			{
				if (err)
				{
					console.log ('rename error:' + err);
					res.end (':-1');
				}
				else
				{
					console.log ('changeAvatar ok:' + account);
					res.end (':1');
				}
			});
		}
	});
});

router.post ('/changeName', function (req, res)
{
	var params = [req.body.account, req.body.name];
	connection.query ('call changeName(?,?);', params, function (err)
	{
		if (err)
		{
			console.log ('changeName err:' + err);
			res.end (':-1');
		}
		else
		{
			console.log ('changeName ok:' + params);
			res.end (':1');
		}
	});
});

router.post ('/changePassword', function (req, res)
{
	var params = [req.body.account, req.body.passwordOld, req.body.passwordNew];
	connection.query ('call changePassword(?,?,?);', params, function (err, rows)
	{
		if (err)
		{
			console.log ('changePassword err:' + err);
			res.end (':-1');
		}
		else if (JSON.parse (JSON.stringify (rows[0]))[0].num === 0)
		{
			console.log ('changePassword wrong old password:' + params);
			res.end (':0');
		}
		else
		{
			console.log ('changePassword ok:' + params);
			res.end (':1');
		}
	});
});

router.post ('/forgetPassword', function (req, res)
{
	var params = [req.body.account, req.body.password];
	connection.query ('call forgetPassword(?,?);', params, function (err, rows)
	{
		if (err)
		{
			console.log ('forgetPassword err:' + err);
			res.end (':-1');
		}
		else
		{
			console.log ('forgetPassword ok:' + params);
			res.end (':1');
		}
	});
});

module.exports = router;

/*
 //串行且无关联
 console.time ('series');
 console.log ('series');
 async.series ({
 one: function (callback)
 {
 for (var i = 1; i < 1000000; ++i)
 {
 }
 callback (null, 1);
 },
 two: function (callback)
 {
 for (var i = 1; i < 1000000; ++i)
 {
 }
 callback (null, 2);
 }
 }, function (err, results)
 {
 console.log ('err: ' + err);
 console.log ('one: ' + results.one);
 console.log ('two: ' + results.two);
 console.timeEnd ('series');
 });

 //并行且无关联
 console.time ('parallel');
 console.log ('parallel');
 async.parallel ({
 one: function (callback)
 {
 for (var i = 1; i < 1000000; ++i)
 {
 }
 callback (null, 1);
 },
 two: function (callback)
 {
 for (var i = 1; i < 1000000; ++i)
 {
 }
 callback (null, 2);
 }
 }, function (err, results)
 {
 console.log ('err: ' + err);
 console.log ('one: ' + results.one);
 console.log ('two: ' + results.two);
 console.timeEnd ('parallel');
 });

 //串行且有关联
 //waterfall只能用数组[]，不能用JSON{}
 console.log ('waterfall');
 async.waterfall ([
 function (callback)
 {
 var num = 1;
 if (num > 1)
 {
 callback ('bigger than 1', -1);
 }
 else
 {
 callback (null, num);
 }
 }, function (data, callback)
 {
 data += 2;
 callback (null, data);
 }
 ], function (err, results)
 {
 console.log ('err: ' + err);
 console.log ('results: ' + results);
 });
 */