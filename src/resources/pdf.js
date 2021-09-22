import PdfPrinter from 'pdfmake';
import { join } from 'path';
import { getPostReadbleStream, getBlogPosts } from './posts.js';

import axios from 'axios';
const fonts = {
	Roboto: {
		normal: 'Helvetica',
		bold: 'Helvetica-Bold',
	},
};
const printer = new PdfPrinter(fonts);
export const getPdfReadableStream = async (filteredPost) => {
	let imagePart = {};
	if (filteredPost.cover) {
		const response = await axios.get(filteredPost.cover, {
			responseType: 'arraybuffer',
		});
		const filteredPostCoverURLParts = filteredPost.cover.split('/');
		const fileName =
			filteredPostCoverURLParts[filteredPostCoverURLParts.length - 1];
		const [id, extension] = fileName.split('.');
		const base64 = response.data.toString('base64');
		const base64Image = `data:image/${extension};base64,${base64}`;
		imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
	}
	const docDefinition = {
		content: [
			imagePart,
			{
				text: filteredPost.title,
				fontSize: 20,
				bold: true,
				margin: [0, 0, 0, 40],
			},
			{ text: filteredPost.content },
		],
	};

	const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
	pdfReadableStream.end();

	return pdfReadableStream;
};
