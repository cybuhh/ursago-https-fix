'use strict';

const { promisify } = require('util');
const mysql = require('mysql');

const tableName = 'wp_posts';

(async function main() {
	try {
		const connection = mysql.createConnection(JSON.parse(process.env.MYSQL));
		const query = await promisify(connection.query).bind(connection);
		const result = await query(`select id,post_content from ${tableName} where post_status="publish" and post_type in ("post", "page") `);
		await Promise.all(result.map(row => {
			const postContent = row.post_content.replace(new RegExp(process.env.TXT_SEARCH, 'g'), process.env.TXT_REPLACE);
            return query(`UPDATE ${tableName} SET post_content = ? where id = ?`, [postContent, row.id]);
		}));
        connection.end();
		console.info('all done');
	} catch (e) {
		console.error(e);
	}
})();
