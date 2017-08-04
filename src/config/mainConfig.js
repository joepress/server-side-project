exports.DATABASE_URL = process.env.DATABASE_URL ||
					   global.DATABASE_URL ||
					  'mongodb://joepress:Herewego16@ds127883.mlab.com:27883/photo-db-app';
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://joepress:Herewego16@ds127883.mlab.com:27883/photo-db-app');

exports.PORT = process.env.PORT || 8080;

module.exports = {

  tokenSecret: 'This is SUPER secret',
};
