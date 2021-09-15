import express, { json } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';
import uniqid from 'uniqid';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { postsValidation } from './validation.js';
const postsRouter = express.Router();

const postjsonpath = path.join(
	dirname(fileURLToPath(import.meta.url)),
	'posts.json',
);
const getBlogPosts = () => JSON.parse(fs.readFileSync(postjsonpath));
const writeBlogPosts = (content) =>
	fs.writeFileSync(postjsonpath, JSON.stringify(content));

///////////////////post blog posts
postsRouter.post('/', (req, res, next) => {
	try {
		const newBlogPost = {
			...req.body,
			_id: uniqid(),

			createdAt: new Date(),
		};
		const posts = getBlogPosts();
		console.log(posts);
		posts.push(newBlogPost);
		writeBlogPosts(posts);
		res.status(201).send({ id: newBlogPost._id });
	} catch (error) {
		next(error);
	}
	// const errors = validationResult(request);
	// 	if (!errors.isEmpty()) {
	// 		next(404, errors);
	// 	} else {
	// 		const newBlogPost = {
	// 			...request.body,
	// 			_id: uniqid(),

	// 			createdAt: new Date(),
	// 		};
	// 		const posts = getBlogPosts();
	// 		console.log(posts);
	// 		posts.push(newBlogPost);
	// 		writeBlogPosts(posts);
	// 		response.status(201).send({ id: newBlogPost._id });
	// 	}
});
//////////////////////put
postsRouter.put('/:id', (req, res, next) => {
	console.log(req.params.id);
	const posts = getBlogPosts();
	const index = posts.findIndex((p) => p._id === req.params.id);
	console.log(index);
	try {
		if (parseInt(index) !== -1) {
			console.log(posts[index]);
			const updatedpost = { ...posts[index], ...req.body };
			posts[index] = updatedpost;
			writeBlogPosts(posts);
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
postsRouter.get('/', (req, res, next) => {
	try {
		const posts = getBlogPosts();
		res.status(200).send(posts);
	} catch (error) {
		next(error);
	}
});
postsRouter.get('/:id', (req, res, next) => {
	try {
		const posts = getBlogPosts();
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

////////////////////////delete
postsRouter.delete('/:id', (req, res, next) => {
	try {
		const posts = getBlogPosts();
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
