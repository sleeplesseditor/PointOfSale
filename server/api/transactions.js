const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const Inventory = require('./inventory');

app.use(bodyParser.json());

module.exports = app;

//Create Database
const Transactions = new Datastore({ 
	filename: './server/databases/transactions.db', 
	autoload: true 
});

app.get('/', function (req, res) {
	res.send('Transactions API')
});

//GET all transactions
app.get('/all', function (req, res) {
	Transactions.find({}, function (err, docs) {
		res.send(docs)
	});
});

//GET all transactions
app.get('/limit', function (req, res) {
	const limit = parseInt(req.query.limit, 10)
	if (!limit) limit = 5
	Transactions.find({}).limit(limit).sort({ date: -1 }).exec(function (err, docs) {
	  res.send(docs)
	});
});

//GET total sales for the current day
app.get('/day-total', function (req, res) {
	//If date is provided
	if (req.query.date) {
		startDate = new Date(req.query.date)
		startDate.setHours(0,0,0,0)
		endDate = new Date(req.query.date)
		endDate.setHours(23,59,59,999)
	}
	else {
		//Beginning of current day
		const startDate = new Date()
		startDate.setHours(0,0,0,0)
		//End of current day
		const endDate = new Date()
		endDate.setHours(23,59,59,999)	
	}

	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		
		const result = {
			date: startDate
		}
		if (docs) {
			const total = docs.reduce(function (p, c) {
				return p + c.total
			}, 0.00)
			result.total = parseFloat(parseFloat(total).toFixed(2))
			res.send(result)
		}
		else {
			result.total = 0
			res.send(result)
		}
	});	
});

// GET transactions for a particular date
app.get('/by-date', function (req, res) {
	
	const startDate = new Date(2018, 2, 21)
	startDate.setHours(0,0,0,0)
	const endDate = new Date(2015, 2, 21)
	endDate.setHours(23,59,59,999)
	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		if (docs)
			res.send(docs)
	})
})

//Add new transaction
app.post('/new', function (req, res) {
	const newTransaction = req.body
	
	Transactions.insert(newTransaction, function (err, transaction) {
		if (err) 
			res.status(500).send(err)
		else {
			res.sendStatus(200)
			Inventory.decrementInventory(transaction.products)
		} 
	});
});

//GET a single transaction
app.get('/:transactionId', function (req, res) {
	Transactions.find({ _id: req.params.transactionId }, function (err, doc) {
		if (doc)
			res.send(doc[0])
	});
});