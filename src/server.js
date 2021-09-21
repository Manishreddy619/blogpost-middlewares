import express from 'express';
import cors from 'cors';
import postsRouter from './resources/posts.js';
import {
	badrequest,
	serverside,
	notfound,
	forbiden,
	unauther,
} from './errorhandlers.js';
import { join } from 'path';
const server = express();
const port = process.env.PORT || 3002;

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOpts = {
	origin: function (origin, next) {
		console.log('CURRENT ORIGIN: ', origin);
		if (!origin || whitelist.indexOf(origin) !== -1) {
			// if received origin is in the whitelist we are going to allow that request
			next(null, true);
		} else {
			// if it is not, we are going to reject that request
			next(new Error(`Origin ${origin} not allowed!`));
		}
	},
};
const publicFolderPath = join(process.cwd(), 'public');
console.log(publicFolderPath);

///////////////global middle wares
server.use(express.static(publicFolderPath));
server.use(cors(corsOpts));
server.use(express.json());

////////////////////////routes ENDPOINTS
server.use('/blogPosts', postsRouter);

////////////////////error haNDLERS
server.use(unauther);
server.use(badrequest);
server.use(notfound);
server.use(forbiden);
server.use(serverside);
////server is listening
server.listen(port, (req, res) => {
	console.log(`server running on port ${port}`);
});
