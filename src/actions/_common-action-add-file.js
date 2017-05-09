import path from 'path';
import * as fspp from '../fs-promise-proxy';

export default function* addFile(data, cfg, plop, opts = {}) {
	// if not already an absolute path, make an absolute path from the basePath (plopfile location)
	const makeTmplPath = p => path.resolve(plop.getPlopfilePath(), p);
	const makeDestPath = p => path.resolve(plop.getDestBasePath(), p);

	var {
		template
	} = cfg;
	var tplData = Object.assign(opts, cfg, data);
	var destPath = plop.renderString(cfg.path || '', tplData);
	const fileDestPath = makeDestPath(destPath);

	try {
		if (cfg.templateFile) {
			let tplPath = plop.renderString(cfg.templateFile, data);
			template = yield fspp.readFile(makeTmplPath(tplPath));
		}
		if (template == null) {
			template = '';
		}

		// check path
		const pathExists = yield fspp.fileExists(fileDestPath);

		if (pathExists) {
			throw 'File already exists';
		} else {
			yield fspp.makeDir(path.dirname(fileDestPath));
			var templateResult = plop.renderString(template, data);
			yield fspp.writeFile(fileDestPath, templateResult);
		}

		// return the added file path (relative to the destination path)
		return fileDestPath.replace(path.resolve(plop.getDestBasePath()), '');

	} catch (err) {
		if (typeof err === 'string') {
			throw err;
		} else {
			throw err.message || JSON.stringify(err);
		}
	}
}