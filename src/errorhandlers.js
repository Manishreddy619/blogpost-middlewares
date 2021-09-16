export const badrequest = (err, req, res, next) => {
	if (err.status === 400) {
		res.status(400).send(err.message);
	} else {
		next(err);
	}
};
export const unauther = (err, req, res, next) => {
	if (err.status === 401) {
		res.status(401).send(err.message);
	} else {
		next(err);
	}
};

export const notfound = (err, req, res, next) => {
	console.log('err', err);
	if (err.status === 404) {
		res.status(404).send({ status: 'failed', message: err.message });
	} else {
		next(err);
	}
};
export const forbiden = (err, req, res, next) => {
	if (err.status === 403) {
		res.status(403).send('not AUTHORIZED');
	} else {
		next(err);
	}
};
export const serverside = (err, req, res, next) => {
	console.log(err);
	if (err.status === 500) {
		res.status(500).send('server error');
	} else {
		next(err);
	}
};
