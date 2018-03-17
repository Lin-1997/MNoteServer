var mysql = require ('mysql');

var connection = mysql.createConnection ({
	host: 'localhost',
	user: 'root',
	password: '0000',
	database: 'MNote',
	charset: 'UTF8_GENERAL_CI'
});

connection.connect (function (err)
{
	if (err)
	{
		throw err;
	}
});

module.exports = connection;
