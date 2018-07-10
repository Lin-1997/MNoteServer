var express = require ('express');
var router = express.Router ();

router.get ('/logo', function (req, res)
{
	res.sendFile ('/root/MNoteServer/public/images/logo.png');
});

module.exports = router;