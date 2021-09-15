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
const server = express();
const port = 3002;

///////////////global middle wares
server.use(cors());
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
