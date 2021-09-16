import express, { json } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';

import uniqid from 'uniqid';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { postsValidation } from './validation.js';
import multer from 'multer';
import fs from 'fs-extra';
const postsRouter = express.Router();

const { readJSON, writeJSON, writeFile } = fs;
const postjsonpath = path.join(
	dirname(fileURLToPath(import.meta.url)),
	'posts.json',
);
const publicFolderPath = join(process.cwd(), './public/img/posts');
const getBlogPosts = () => readJSON(postjsonpath);
const writeBlogPosts = (content) => writeJSON(postjsonpath, content);

const savepostpicture = (name, contentasbuffer) =>
	writeFile(join(publicFolderPath, name), contentasbuffer);
///////////////////post blog posts
postsRouter.post('/', postsValidation, async (req, res, next) => {
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
			const newBlogPost = {
				...req.body,
				_id: uniqid(),

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
});
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
postsRouter.put('/:id', async (req, res, next) => {
	console.log(req.params.id);
	const posts = await getBlogPosts();
	const index = posts.findIndex((p) => p._id === req.params.id);
	console.log(index);
	try {
		if (parseInt(index) !== -1) {
			console.log(posts[index]);
			const updatedpost = { ...posts[index], ...req.body };
			posts[index] = updatedpost;
			await writeBlogPosts(posts);
			res.send(updatedpost);
		} else {
			next(
				createHttpError(404, `bad request with ${req.params.id} , not found`),
			);
		}
	} catch (error) {
		next(error);
	}
});

//////////////////// get
postsRouter.get('/', async (req, res, next) => {
	try {
		const posts = await getBlogPosts();
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
export default postsRouter;
