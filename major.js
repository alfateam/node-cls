let versionArray = process.version.replace('v', '').split('.');
module.exports =  parseInt(versionArray[0]);
