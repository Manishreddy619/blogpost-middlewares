import { body } from 'express-validator';

export const postsValidation = [
	body('title').exists().withMessage('mandotary-field'),
	body('category').exists().withMessage('required'),
	body('content').exists().withMessage('required'),
];
