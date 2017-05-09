import co from 'co';
import path from 'path';
import globby from 'globby';
import actionInterfaceTest from './_common-action-interface-check';
import addFile from './_common-action-add-file';

export default co.wrap(function* (data, cfg, plop, opts = {}) {
	const cfgWithCommonInterface = Object.assign({}, cfg, {
		path: cfg.destination
	});
	const interfaceTestResult = actionInterfaceTest(cfgWithCommonInterface);
	if (interfaceTestResult !== true) {
		throw interfaceTestResult;
	}

	const templateFiles = resolveTemplateFiles(cfg.templateFiles, plop);
	const filesAdded = [];
	for (let templateFile of templateFiles) {
		const fileCfg = Object.assign({}, cfg, {
			path: resolvePath(cfg.destination, templateFile, cfg.base),
			templateFile: templateFile
		});

		const addedPath = yield addFile(data, fileCfg, plop, opts);
		filesAdded.push(addedPath);
	}

	return `${filesAdded.length} files added\n\t - ${filesAdded.join('\n\t - ')}`;
});

function resolveTemplateFiles(templateFilesGlob, plop) {
	return globby.sync([templateFilesGlob], {
		cwd: plop.getPlopfilePath()
	}).filter(isFile);
}

function isFile(file) {
	const fileParts = file.split(path.sep);
	const lastFilePart = fileParts[fileParts.length - 1];
	const hasExtension = !!(lastFilePart.split('.')[1]);

	return hasExtension;
}

function resolvePath(destination, file, rootPath) {
	return path.join(destination, dropFileRootPath(file, rootPath));
}

function dropFileRootPath(file, rootPath) {
	return (rootPath) ? file.replace(rootPath, '') : dropFileRootFolder(file);
}

function dropFileRootFolder(file) {
	const fileParts = file.split(path.sep);
	fileParts.shift();

	return fileParts.join(path.sep);
}