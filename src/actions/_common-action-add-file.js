import path from 'path';
import * as fspp from '../fs-promise-proxy';

export default function* addFile(data, cfg, plop, opts = {}) {
	// if not already an absolute path, make an absolute path from the basePath (plopfile location)

	let tmplBaseBath = plop.getPlopfilePath();
	let destBasePath = plop.getDestBasePath();

	const makeTmplPath = p => path.resolve(tmplBaseBath, p);
	const makeDestPath = p => path.resolve(destBasePath, p);

	var {
		template
	} = cfg;
	var tplData = Object.assign(opts, cfg, data);
	var destPath = plop.renderString(cfg.path || '', tplData);
	const fileDestPath = makeDestPath(destPath);

	try {
		if (cfg.templateFile) {
			let tplPath = plop.renderString(cfg.templateFile, data);
			let tplFilePath = makeTmplPath(tplPath);
			template = yield fspp.readFile(tplFilePath);
		}
		if (template == null) {
			template = '';
		}

		let fsys = opts.fsys || fspp;

		// check path
		const pathExists = yield fsys.fileExists(fileDestPath);

		if (pathExists) {
			throw 'File already exists';
		} else {
			yield fsys.makeDir(path.dirname(fileDestPath));
			var templateResult = plop.renderString(template, data);
			yield fsys.writeFile(fileDestPath, templateResult);
		}

		// return the written file or the added file path (relative to the destination path)
		return opts.fsys ? fsys.config : fileDestPath.replace(path.resolve(plop.getDestBasePath()), '');
	} catch (err) {
		if (typeof err === 'string') {
			throw err;
		} else {
			throw err.message || JSON.stringify(err);
		}
	}
}