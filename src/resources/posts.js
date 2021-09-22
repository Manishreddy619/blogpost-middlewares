import express, { json } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';
import { pipeline } from 'stream';
import { createGzip } from 'zlib';
import uniqid from 'uniqid';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { postsValidation } from './validation.js';
import multer from 'multer';
import fs from 'fs-extra';
import getPdfReadableStream from './pdf.js';
const postsRouter = express.Router();

const { readJSON, writeJSON, writeFile } = fs;
const postjsonpath = path.join(
	dirname(fileURLToPath(import.meta.url)),
	'posts.json',
);
const publicFolderPath = join(process.cwd(), './public/img/posts');
export const getBlogPosts = () => readJSON(postjsonpath);
const writeBlogPosts = (content) => writeJSON(postjsonpath, content);

export const getPostReadbleStream = () => fs.createReadStream(postjsonpath);
const savepostpicture = (name, contentasbuffer) =>
	writeFile(join(publicFolderPath, name), contentasbuffer);
///////////////////post blog posts
postsRouter.post(
	'/',
	multer().array('profilepic'),
	postsValidation,
	async (req, res, next) => {
		// try {
		// 	const newBlogPost = {
		// 		...req.body,
		// 		_id: uniqid(),

		// 		createdAt: new Date(),
		// 	};
		// 	const posts = getBlogPosts();
		// 	console.log(posts);
		// 	posts.push(newBlogPost);
		// 	writeBlogPosts(posts);
		// 	res.status(201).send({ id: newBlogPost._id });
		// } catch (error) {
		// 	next(error);
		// }
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				next(createHttpError(400, `bad request`));
			} else {
				const { title, category, content } = req.body;
				let filesCollection = [];
				// console.log(posts[index]);
				req.files.map((file) => {
					// console.log(file);
					return filesCollection.push(file);
				});
				const newBlogPost = {
					title,
					category,
					content,
					comments: [],
					readTime: {},
					_id: uniqid(),
					cover:
						filesCollection &&
						`http://localhost:3002/img/posts/${filesCollection[0]?.originalname}`,
					author: {
						name: '',
						avatar:
							filesCollection &&
							`http://localhost:3002/img/posts/${filesCollection[0]?.originalname}`,
					},
					createdAt: new Date(),
				};
				const posts = await getBlogPosts();
				console.log(posts);
				posts.push(newBlogPost);
				await writeBlogPosts(posts);
				res.status(201).send({ id: newBlogPost._id });
			}
		} catch (error) {
			next(error);
		}
	},
);
postsRouter.post(
	'/:id/uploadAvatar',
	multer().single('profilepic'),
	async (req, res, next) => {
		try {
			const posts = await getBlogPosts();
			const index = posts.findIndex((p) => p._id === req.params.id);
			console.log(posts[index].cover);

			await savepostpicture(req.file.originalname, req.file.buffer);
			posts[
				index
			].cover = `http://localhost:3002/img/posts/${req.file.originalname}`;

			await writeBlogPosts(posts);
			res.send(posts[index]);
			res.send('ok');
		} catch (error) {
			next(console.error());
		}
	},
);
postsRouter.post(
	'/:id/author',
	multer().single('profilepic'),
	async (req, res, next) => {
		try {
			const posts = await getBlogPosts();
			const index = posts.findIndex((p) => p._id === req.params.id);
			console.log(posts[index].cover);

			await savepostpicture(req.file.originalname, req.file.buffer);
			posts[
				index
			].author.avatar = `http://localhost:3002/img/posts/${req.file.originalname}`;
			console.log(posts[index]);
			await writeBlogPosts(posts);
			res.send(posts[index]);
			res.send('ok');
		} catch (error) {
			next(console.error());
		}
	},
);
postsRouter.post('/:id/comments', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
		const index = posts.findIndex((p) => p._id === req.params.id);
		if (parseInt(index) !== -1) {
			posts[index].comments.push(req.body);
			await writeBlogPosts(posts);
			res.send(posts[index].comments);
		} else {
			next(createHttpError(404, 'not found, check the id once'));
		}
	} catch (error) {
		next(console.error());
	}
});
//////////////////////put
postsRouter.put(
	'/:id',
	multer().array('profilepic'),
	postsValidation,
	async (req, res, next) => {
		console.log(req.params.id);
		const posts = await getBlogPosts();
		const index = posts.findIndex((p) => p._id === req.params.id);
		// console.log(index);
		try {
			if (parseInt(index) !== -1) {
				let filesCollection = [];
				// console.log(posts[index]);
				req.files.map((file) => {
					savepostpicture(file.originalname, file.buffer);
					return filesCollection.push(file);
				});
				// 	const arrayOfPromises = req.files.map((file) =>
				// 		savepostpicture(file.originalname, file.buffer),
				// 	);
				// let mydata = await Promise.all(arrayOfPromises);
				console.log(filesCollection);
				if (filesCollection) {
					posts[
						index
					].cover = `http://localhost:3002/img/posts/${filesCollection[0]?.originalname}`;
					posts[
						index
					].author.avatar = `http://localhost:3002/img/posts/${filesCollection[1]?.originalname}`;
					await writeBlogPosts(posts);
					const updatedpost = { ...posts[index], ...req.body };
					posts[index] = updatedpost;
					await writeBlogPosts(posts);
					res.send(updatedpost);
				}
			} else {
				next(
					createHttpError(404, `bad request with ${req.params.id} , not found`),
				);
			}
		} catch (error) {
			next(error);
		}
	},
);

//////////////////// get
postsRouter.get('/', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
		console.log(posts);
		res.status(200).send(posts);
	} catch (error) {
		next(error);
	}
});
postsRouter.get('/:id', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
		const filteredPost = posts.find((post) => post._id === req.params.id);
		console.log(filteredPost);
		if (filteredPost) {
			res.status(200).send(filteredPost);
		} else {
			next(
				createHttpError(
					400,
					`id:  ${req.params.id} , not found,try with proper id`,
				),
			);
		}
	} catch (error) {
		next(error);
	}
});
postsRouter.get('/:id/comments', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
		const filteredPost = posts.find((post) => post._id === req.params.id);
		console.log(filteredPost);
		if (filteredPost) {
			res.status(200).send(filteredPost.comments);
		} else {
			next(
				createHttpError(
					400,
					`id:  ${req.params.id} , not found,try with proper id`,
				),
			);
		}
	} catch (error) {
		next(error);
	}
});
////////////////////////delete
postsRouter.delete('/:id', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
		const filteredPost = posts.filter((post) => post._id !== req.params.id);
		const checkid = posts.find((post) => post._id === req.params.id);
		if (checkid) {
			writeBlogPosts(filteredPost);

			res.status(204).send();
		} else {
			next(createHttpError(404, 'not found'));
		}
	} catch (error) {
		next(error);
	}
});
postsRouter.get('/JSONData/data', async (req, res, next) => {
	try {
		// souce
		res.setHeader('content-Disposition', `attachment; filename=posts.json.gz`);
		const source = getPostReadbleStream();
		const transform = createGzip();
		const destination = res;
		// destinaton

		pipeline(source, transform, destination, (err) => {
			if (err) next(err);
		});
	} catch (error) {
		next(error);
	}
});
postsRouter.get('/pdfdownload/data', async (req, res, next) => {
	try {
		res.setHeader('Content-Disposition', `attachment; filename = json.pdf`);
		const source = getPdfReadableStream({ data: await getBlogPosts() });
		const destination = res;
		pipeline(source, destination, (err) => {
			if (err) next(err);
		});
	} catch (error) {
		next(error);
	}
});
// souce
// res.setHeader('content-Disposition', `attachment; filename=posts.json`);
// const source = getPostReadbleStream();
// const destination = fs.createWriteStream('copy.json');
// // destinaton

// pipeline(source, destination, (err) => {
// 	if (err) next(err);
// });
export default postsRouter;
