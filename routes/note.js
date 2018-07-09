var express = require ('express');
var router = express.Router ();
var connection = require ('../DB');
var async = require ('async');

router.post ('/upload', function (req, res)
{
	var account = req.body.account;
	var noteSize = req.body.noteSize;
	var deleteLogSize = req.body.deleteLogSize;

	var runAddNote = false;
	var runUpdateNote = false;
	var runDeleteNote = false;

	var addNote = 'insert note values';
	var addParams = [];
	var updateNote = 'update note set updateDate=case id ';
	var updateParams = [];
	for (var i = 0, j = 0, k = 0; i < noteSize; ++i)
	{
		if (req.body['status' + i] === -1)
		{
			runAddNote = true;
			addNote += '("' + account + '","' + req.body['id' + i] + '","' +
				req.body['updateDate' + i] + '","' + req.body['updateTime' + i] + '",?),';
			addParams[j] = req.body['content' + i];
			++j;
		}
		else if (req.body["status" + i] === 1)
		{
			runUpdateNote = true;
			updateNote += 'when "' + req.body['id' + i]
				+ '" then "' + req.body['updateDate' + i] + '" ';
			updateParams[k] = req.body['content' + i];
			++k;
		}
	}
	addNote = addNote.substr (0, addNote.length - 1) + ';';
	if (runAddNote)
	{
		console.log ('addNote:' + addNote);
		console.log ('addParams:' + addParams);
	}

	updateNote += 'end, updateTime=case id ';
	for (i = 0; i < noteSize; ++i)
	{
		if (req.body["status" + i] === 1)
		{
			updateNote += 'when "' + req.body['id' + i]
				+ '" then "' + req.body['updateTime' + i] + '" ';
		}
	}
	updateNote += 'end, content=case id ';
	for (i = 0; i < noteSize; ++i)
	{
		if (req.body["status" + i] === 1)
		{
			updateNote += 'when "' + req.body['id' + i]
				+ '" then ? ';
		}
	}
	updateNote += 'end where account="' + account + '" and id in(';
	for (i = 0; i < noteSize; ++i)
	{
		if (req.body["status" + i] === 1)
		{
			updateNote += '"' + req.body["id" + i] + '",';
		}
	}
	updateNote = updateNote.substr (0, updateNote.length - 1) + ');';
	if (runUpdateNote)
	{
		console.log ('updateNote；' + updateNote);
		console.log ('updateParams:' + updateParams);
	}

	var deleteNote = 'delete from note where ';
	var deleteParams = [];
	for (i = 0; i < deleteLogSize; ++i)
	{
		runDeleteNote = true;
		deleteParams[i] = req.body["deleteLog" + i];
		deleteNote += 'id = ? or ';
	}
	deleteNote = deleteNote.substr (0, deleteNote.length - 4) + ';';
	if (runDeleteNote)
	{
		console.log ('deleteNote:' + deleteNote);
		console.log ('deleteParams:' + deleteParams);
	}

	connection.query ('set autocommit=0;');
	connection.query ('begin;');

	async.parallel ({
			one: function (callback)
			{
				if (runAddNote)
				{
					connection.query (addNote, addParams, function (err)
					{
						if (err)
						{
							console.log ('addNote err:' + err);
							res.end (":-1");
							callback (err, 1);
						}
						else
						{
							console.log ('addNote ok:' + addParams);
							callback (null, 1);
						}
					});
				}
				else
				{
					console.log ('addNote empty:' + addParams);
					callback (null, 1);
				}
			},
			two: function (callback)
			{
				if (runUpdateNote)
				{
					connection.query (updateNote, updateParams, function (err)
					{
						if (err)
						{
							console.log ('updateNote err:' + err);
							res.end (":-1");
							callback (err, 2);
						}
						else
						{
							console.log ('updateNote ok:' + updateParams);
							callback (null, 2);
						}
					});
				}
				else
				{
					console.log ('updateNote empty:' + updateParams);
					callback (null, 2);
				}
			},
			three: function (callback)
			{
				if (runDeleteNote)
				{
					connection.query (deleteNote, deleteParams, function (err)
					{
						if (err)
						{
							console.log ('deleteNote err:' + err);
							res.end (":-1");
							callback (err, 3);
						}
						else
						{
							console.log ('deleteNote ok:' + deleteParams);
							callback (null, 3);
						}
					});
				}
				else
				{
					console.log ('deleteNote empty:' + deleteParams);
					callback (null, 3);
				}
			}
		},
		function (err)
		{
			if (err !== null)
			{
				console.log ('err: ' + err);
				connection.query ('rollback');
				connection.query ('set autocommit=1;');
			}
			else
			{
				console.log ('upload ok:' + JSON.stringify (req.body));
				connection.query ('commit');
				connection.query ('set autocommit=1;');
				res.end (':0');
			}
		});
});

router.post ('/download', function (req, res)
{
	var params = [req.body.account];
	connection.query ('call getNote(?);', params, function (err, rows)
	{
		if (err)
		{
			console.log ('getNote err:' + err);
			res.end (':-1');
		}
		else if (JSON.parse (JSON.stringify (rows[0])).length === 0)
		{
			console.log ('getNote empty:' + params);
			res.end (':0');
		}
		else
		{
			var size = JSON.parse (JSON.stringify (rows[0])).length;
			var json = {};
			json['size'] = size;
			var item;
			for (var i = 0; i < size; ++i)
			{
				item = JSON.parse (JSON.stringify (rows[0]))[i];
				json['id' + i] = item.id;
				json['updateDate' + i] = item.updateDate.substr (0, 10);
				json['updateTime' + i] = item.updateTime;
				json['content' + i] = item.content;
			}
			console.log ('getNote ok:' + params);
			console.log ('getNote ok:' + JSON.stringify (json));
			res.send (json);
		}
	});
});

module.exports = router;