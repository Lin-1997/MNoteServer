var express = require ('express');
var router = express.Router ();
var connection = require ('../DB');

router.post ('/getNote', function (req, res)
{
	var account = req.body.account;
	connection.query ('call getNote("' + account + '");', function (err, rows)
	{
		if (err)
		{
			console.log ('getNote err:' + err);
			res.end (':-10');
		}
		else
		{
			//没完成
			//res.send(JSON.parse(JSON.stringify(rows[0]))[0]);
			res.end (':1');
		}
	});
});

module.exports = router;